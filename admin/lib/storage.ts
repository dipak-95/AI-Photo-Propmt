import dbConnect from './mongodb';
import Prompt from './models';

// Interface compatibility
export interface PromptData {
    id: string;
    title: string;
    prompt: string;
    imageUrl: string;
    style: string;
    keywords: string[];
    category: string;
    createdAt: string;
}

// Convert Mongoose doc to plain object and map _id to id
function mapDoc(doc: any): PromptData {
    return {
        id: doc._id.toString(),
        title: doc.title,
        prompt: doc.prompt,
        imageUrl: doc.imageUrl,
        style: doc.style,
        keywords: doc.keywords,
        category: doc.category || 'Men', // Default to Men for existing data
        createdAt: doc.createdAt.toISOString(),
    };
}

export async function getPrompts(): Promise<PromptData[]> {
    await dbConnect();
    const prompts = await Prompt.find({}).sort({ createdAt: -1 });
    return prompts.map(mapDoc);
}

export async function addPrompt(data: Omit<PromptData, 'id' | 'createdAt'>): Promise<PromptData> {
    await dbConnect();
    const newPrompt = await Prompt.create(data);
    return mapDoc(newPrompt);
}

export async function deletePrompt(id: string): Promise<void> {
    await dbConnect();
    await Prompt.findByIdAndDelete(id);
}

export async function updatePrompt(id: string, data: Partial<PromptData>): Promise<PromptData | null> {
    await dbConnect();
    const updated = await Prompt.findByIdAndUpdate(id, data, { new: true });
    return updated ? mapDoc(updated) : null;
}
