import { NextResponse } from 'next/server';
import { getPrompts, addPrompt } from '@/lib/storage';

export async function GET() {
    const prompts = await getPrompts();
    return NextResponse.json(prompts);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { title, prompt, imageUrl, style, keywords, category } = body;

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
    });

    return NextResponse.json(newPrompt);
}
