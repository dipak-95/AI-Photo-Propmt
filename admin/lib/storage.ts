import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

export interface Prompt {
    id: string;
    title: string;
    prompt: string;
    imageUrl: string; // We'll just store the URL
    style: string;
    keywords: string[];
    createdAt: string;
}

// Initial Data
const INITIAL_DATA: Prompt[] = [
    {
        id: '1',
        title: 'Cyberpunk City',
        prompt: 'A futuristic city with neon lights, raining, reflections on the street, high detail, 8k, cinematic lighting, cyberpunk style',
        imageUrl: 'https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=2998&auto=format&fit=crop',
        style: 'Cinematic',
        keywords: ['cyberpunk', 'neon', 'city', 'future'],
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Golden Retriever Portrait',
        prompt: 'A cute golden retriever puppy sitting in a field of sunflowers, golden hour lighting, shallow depth of field, hyper realistic, photography',
        imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80&w=2787&auto=format&fit=crop',
        style: 'Realistic',
        keywords: ['dog', 'puppy', 'nature', 'cute'],
        createdAt: new Date().toISOString(),
    }
];

export async function getPrompts(): Promise<Prompt[]> {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2));
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return INITIAL_DATA;
    }
}

export async function addPrompt(prompt: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt> {
    const prompts = await getPrompts();
    const newPrompt: Prompt = {
        ...prompt,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
    };
    prompts.unshift(newPrompt);
    fs.writeFileSync(DATA_FILE, JSON.stringify(prompts, null, 2));
    return newPrompt;
}

export async function deletePrompt(id: string): Promise<void> {
    let prompts = await getPrompts();
    prompts = prompts.filter(p => p.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(prompts, null, 2));
}

export async function updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt | null> {
    const prompts = await getPrompts();
    const index = prompts.findIndex(p => p.id === id);
    if (index === -1) return null;

    prompts[index] = { ...prompts[index], ...data };
    fs.writeFileSync(DATA_FILE, JSON.stringify(prompts, null, 2));
    return prompts[index];
}
