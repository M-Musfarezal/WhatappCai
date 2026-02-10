import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';

async function startBasic() {
    // 1. Setup tempat simpan login (session)
    const { state, saveCreds } = await useMultiFileAuthState('auth_basic');

    // 2. Start connection
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // QR akan keluar kat terminal/console
        logger: pino({ level: 'silent' }),
    });

    // 3. Simpan login info bila dah scan
    sock.ev.on('creds.update', saveCreds);

    // 4. Pantau status connection
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection terputus. Reconnecting:', shouldReconnect);
            if (shouldReconnect) startBasic();
        } else if (connection === 'open') {
            console.log('BERJAYA! WhatsApp dah connected.');
        }
    });

    // 5. Terima mesej masuk & Auto-Reply simple
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === 'notify') {
            const from = msg.key.remoteJid;
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            
            console.log(`Mesej dari ${from}: ${text}`);

            // Basic Auto-Reply
            if (text?.toLowerCase() === 'ping') {
                await sock.sendMessage(from, { text: 'Pong! 🏓' });
            }
        }
    });
}

console.log('Starting Basic WhatsApp Bot...');
startBasic();
