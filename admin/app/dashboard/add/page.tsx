'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Sparkles, Image as ImageIcon, Upload, Link as LinkIcon, X } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AddPromptPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        prompt: '',
        imageUrl: '',
        style: 'Cinematic',
        keywords: '',
        category: 'Men'
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImageToFirebase = async (file: File): Promise<string> => {
        const timestamp = Date.now();
        const fileName = `prompts/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = formData.imageUrl;

            // If upload mode and file selected, upload to Firebase
            if (uploadMode === 'upload' && selectedFile) {
                setUploading(true);
                finalImageUrl = await uploadImageToFirebase(selectedFile);
                setUploading(false);
            }

            await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    imageUrl: finalImageUrl,
                    keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
                })
            });
            router.push('/dashboard');
        } catch (error) {
            alert('Failed to save prompt');
            setUploading(false);
        } finally {
            setLoading(false);
        }
    };

    const styles = ['Cinematic', 'Realistic', 'Funny', 'Artistic', 'Anime', '3D Render', 'Minimalist'];

    const displayImageUrl = uploadMode === 'upload' ? previewUrl : formData.imageUrl;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/dashboard"
                    className="p-2 glass rounded-xl hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Add New Prompt</h1>
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

                        {/* Image Upload/URL Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Image</label>
                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('url')}
                                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${uploadMode === 'url'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-black/40 text-gray-400 border border-white/10'
                                        }`}
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('upload')}
                                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${uploadMode === 'upload'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-black/40 text-gray-400 border border-white/10'
                                        }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </button>
                            </div>

                            {uploadMode === 'url' ? (
                                <input
                                    required={uploadMode === 'url'}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="https://..."
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                        required={uploadMode === 'upload'}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-pointer hover:border-purple-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        {selectedFile ? selectedFile.name : 'Choose image file'}
                                    </label>
                                    {selectedFile && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl('');
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-red-500/20 rounded-lg hover:bg-red-500/30"
                                        >
                                            <X className="w-4 h-4 text-red-400" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none appearance-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                            </select>
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
                        disabled={loading || uploading}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <Upload className="w-5 h-5 animate-pulse" />
                                Uploading Image...
                            </>
                        ) : loading ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Prompt
                            </>
                        )}
                    </button>
                </form>

                {/* Preview */}
                <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-400">Preview</p>
                    <div className="glass-card rounded-2xl overflow-hidden aspect-[4/5] relative bg-black/40 flex items-center justify-center">
                        {displayImageUrl ? (
                            <>
                                <img
                                    src={displayImageUrl}
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
