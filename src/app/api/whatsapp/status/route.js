import { getQR, getSock, connectToWhatsApp } from '@/lib/whatsapp';
import { NextResponse } from 'next/server';

export async function GET() {
    let sock = getSock();
    
    if (!sock) {
        console.log('Starting WhatsApp connection...');
        await connectToWhatsApp();
    }

    const qr = getQR();
    
    return NextResponse.json({
        connected: !!(sock && sock.user),
        qr: qr || null,
        user: sock?.user || null
    });
}
