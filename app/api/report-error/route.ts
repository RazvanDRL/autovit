import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: Request) {
    const { message, stack, componentStack, url } = await request.json();

    const errorMessage = `
Error: ${message}
URL: ${url}
Stack: ${stack}
Component Stack: ${componentStack}
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: errorMessage,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message to Telegram');
        }

        return NextResponse.json({ message: 'Error reported successfully' });
    } catch (err) {
        console.error('Failed to send error to Telegram:', err);
        return NextResponse.json({ message: 'Failed to send error to Telegram' }, { status: 500 });
    }
}