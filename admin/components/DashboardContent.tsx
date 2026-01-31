'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import PromptCard from '@/components/PromptCard';
import type { PromptData } from '@/lib/storage';
import { useSearchParams } from 'next/navigation';

export default function DashboardContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    const [prompts, setPrompts] = useState<PromptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchPrompts = async () => {
        try {
            const res = await fetch('/api/prompts');
            const data = await res.json();
            setPrompts(data);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this prompt?')) return;

        // Optimistic Update
        setPrompts(prompts.filter(p => p.id !== id));

        await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
    };

    const handleEdit = (prompt: PromptData) => {
        window.location.href = `/dashboard/edit/${prompt.id}`;
    };

    // Filter
    const filteredPrompts = prompts.filter(p =>
        (p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.style.toLowerCase().includes(search.toLowerCase()) ||
            p.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))) &&
        (!category || (p.category === category) || (!p.category && category === 'Men')) // Default legacy docs to Men
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Prompts Library {category && `- ${category}`}</h1>
                    <p className="text-gray-400 mt-1">Manage your AI generated masterpieces</p>
                </div>

                <Link
                    href="/dashboard/add"
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    <Plus className="w-5 h-5" />
                    Add New Photo
                </Link>
            </div>

            {/* Stats Cards (Mock) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 rounded-2xl">
                    <p className="text-gray-400 text-sm">Total Photos</p>
                    <p className="text-3xl font-bold text-white mt-1">{prompts.length}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <p className="text-gray-400 text-sm">Styles Active</p>
                    <p className="text-3xl font-bold text-gradient mt-1">5</p>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <p className="text-gray-400 text-sm">Views Today</p>
                    <p className="text-3xl font-bold text-white mt-1">1,204</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by title, style or keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500 animate-pulse">Loading creative assets...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPrompts.map(prompt => (
                        <PromptCard
                            key={prompt.id}
                            prompt={prompt}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}

                    {filteredPrompts.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No prompts found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
