import { NextResponse } from 'next/server';

export async function GET() {
    // Aap yahan se version control kar sakte hain
    return NextResponse.json({
        version: '4.1.0', // This will trigger update in app if app is < 4
        latestVersion: '4.1.0',
        minRequiredVersion: '4.0.0',
        updateUrl: 'https://play.google.com/store/apps/details?id=com.dipak.pearlai',
        message: 'A major update (v4.0.0) is available! New features and better stability. Update now!',
        forceUpdate: false // Change to true if you want to block old versions
    });
}
