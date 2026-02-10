import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';

let sock = null;
let qrCode = null;

export async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), 'auth_info_baileys'));

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            qrCode = qr;
            console.log('QR Code generated. Please scan.');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('opened connection');
            qrCode = null;
        }
    });

    sock.ev.on('messages.upsert', async m => {
        // console.log(JSON.stringify(m, undefined, 2));
    });

    return sock;
}

export async function sendBlast(numbers, message, delayRange = [5, 15]) {
    if (!sock) throw new Error('WhatsApp not connected');

    const results = [];
    for (const number of numbers) {
        try {
            // Format number (remove + and add @s.whatsapp.net)
            const formattedNumber = number.replace(/\D/g, '') + '@s.whatsapp.net';
            
            // Simulate typing
            await sock.sendPresenceUpdate('composing', formattedNumber);
            
            // Random delay before sending
            const delay = Math.floor(Math.random() * (delayRange[1] - delayRange[0] + 1) + delayRange[0]) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            await sock.sendMessage(formattedNumber, { text: message });
            await sock.sendPresenceUpdate('paused', formattedNumber);
            
            results.push({ number, status: 'sent' });
        } catch (error) {
            results.push({ number, status: 'failed', error: error.message });
        }
    }
    return results;
}

export const getQR = () => qrCode;
export const getSock = () => sock;
