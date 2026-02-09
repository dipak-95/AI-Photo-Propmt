import { NextResponse } from 'next/server';

export async function GET() {
    // Aap yahan se version control kar sakte hain
    return NextResponse.json({
        latestVersion: '2.2.0',
        minRequiredVersion: '1.0.0',
        updateUrl: 'https://play.google.com/store/apps/details?id=com.dipak.pearlai',
        message: 'New features and better stability are available. Update now!',
        forceUpdate: false // Agar true karoge to bina update kiye app nahi chalegi
    });
}
