'use client';

import { Edit, Trash2, Copy, Sparkles } from 'lucide-react';
import type { Prompt } from '@/lib/storage';

interface PromptCardProps {
    prompt: Prompt;
    onDelete: (id: string) => void;
    onEdit: (prompt: Prompt) => void;
}

export default function PromptCard({ prompt, onDelete, onEdit }: PromptCardProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.prompt);
        // Maybe show toast? Keeping it simple.
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
            <div className="relative aspect-[4/5] overflow-hidden">
                <img
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <button
                        onClick={() => onEdit(prompt)}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(prompt.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-full text-red-200 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-medium text-purple-200 mb-2 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3" />
                        {prompt.style}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{prompt.title}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-3">{prompt.prompt}</p>
                </div>
            </div>

            <div className="p-3 border-t border-white/5 bg-black/40 flex justify-between items-center">
                <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[70%]">
                    {prompt.keywords?.map((k, i) => (
                        <span key={i} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-md whitespace-nowrap">
                            #{k}
                        </span>
                    ))}
                </div>
                <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy Prompt"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
