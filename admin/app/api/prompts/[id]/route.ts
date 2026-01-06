import { NextResponse } from 'next/server';
import { deletePrompt, updatePrompt } from '@/lib/storage';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const body = await request.json();
    const updated = await updatePrompt(id, body);
    return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    await deletePrompt(id);
    return NextResponse.json({ success: true });
}
