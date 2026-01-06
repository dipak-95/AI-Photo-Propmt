'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        prompt: '',
        imageUrl: '',
        style: 'Cinematic',
        keywords: ''
    });

    useEffect(() => {
        // Fetch existing data
        const fetchPrompt = async () => {
            try {
                const res = await fetch('/api/prompts');
                const data = await res.json();
                const found = data.find((p: any) => p.id === id);
                if (found) {
                    setFormData({
                        title: found.title,
                        prompt: found.prompt,
                        imageUrl: found.imageUrl,
                        style: found.style,
                        keywords: found.keywords.join(', ')
                    });
                } else {
                    alert('Prompt not found');
                    router.push('/dashboard');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPrompt();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await fetch(`/api/prompts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
                })
            });
            router.push('/dashboard');
        } catch (error) {
            alert('Failed to update prompt');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this prompt?')) return;
        await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
        router.push('/dashboard');
    }

    const styles = ['Cinematic', 'Realistic', 'Funny', 'Artistic', 'Anime', '3D Render', 'Minimalist'];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading prompt details...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 glass rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Edit Prompt</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="text-red-400 hover:text-red-300 flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                            <input
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                placeholder="e.g. Neon Cyberpunk City"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                            <input
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                placeholder="https://..."
                                value={formData.imageUrl}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Style</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none appearance-none"
                                    value={formData.style}
                                    onChange={e => setFormData({ ...formData, style: e.target.value })}
                                >
                                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Keywords</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="cyberpunk, neon, ..."
                                    value={formData.keywords}
                                    onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">AI Prompt</label>
                            <textarea
                                required
                                rows={5}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                placeholder="Detailed description of the image..."
                                value={formData.prompt}
                                onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="w-5 h-5" />
                                Update Prompt
                            </>
                        )}
                    </button>
                </form>

                {/* Preview */}
                <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-400">Preview</p>
                    <div className="glass-card rounded-2xl overflow-hidden aspect-[4/5] relative bg-black/40 flex items-center justify-center">
                        {formData.imageUrl ? (
                            <>
                                <img
                                    src={formData.imageUrl}
                                    className="w-full h-full object-cover"
                                    alt="Preview"
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x500?text=Invalid+Image')}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                                    <span className="inline-block px-2 py-1 bg-purple-500/30 border border-purple-500/50 rounded-lg text-xs text-purple-200 w-fit mb-2">
                                        {formData.style}
                                    </span>
                                    <h3 className="text-xl font-bold text-white line-clamp-1">{formData.title || 'Title'}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">{formData.prompt || 'Prompt description will appear here...'}</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-600">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Image preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
