import { sendBlast, getSock } from '@/lib/whatsapp';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const sock = getSock();
    if (!sock || !sock.user) {
        return NextResponse.json({ error: 'WhatsApp not connected' }, { status: 400 });
    }

    try {
        const { numbers, message, delayMin, delayMax } = await request.json();
        
        if (!numbers || !Array.isArray(numbers) || !message) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // We run this in the background or wait for it? 
        // For a blast, it's better to run and return a session ID, but for now let's wait.
        const results = await sendBlast(numbers, message, [delayMin || 5, delayMax || 15]);

        return NextResponse.json({ success: true, results });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
