import { NextResponse } from 'next/server';
import { getPrompts, addPrompt } from '@/lib/storage';

export async function GET() {
    const prompts = await getPrompts();
    return NextResponse.json(prompts);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { title, prompt, imageUrl, style, keywords, category, tier, isPremium } = body;

    if (!prompt || !imageUrl) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newPrompt = await addPrompt({
        title: title || 'Untitled',
        prompt,
        imageUrl,
        style: style || 'General',
        keywords: keywords || [],
        category: category || 'Men',
        tier: tier || (category === 'Premium' ? 'premium' : 'free'),
        isPremium: isPremium || category === 'Premium' || false,
    });

    return NextResponse.json(newPrompt);
}
