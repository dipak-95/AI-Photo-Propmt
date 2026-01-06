'use client';

import { Shield, Info, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            {/* Privacy Policy */}
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
                        <p className="text-gray-400 text-sm">How we handle your data</p>
                    </div>
                </div>
                <div className="text-gray-300 space-y-2 text-sm">
                    <p>1. <strong>Data Collection</strong>: We only store AI prompts and image URLs you upload.</p>
                    <p>2. <strong>Usage</strong>: Data is used to display content in the mobile app.</p>
                    <p>3. <strong>Security</strong>: Access is restricted to admin credentials.</p>
                </div>
            </div>

            {/* How to Use */}
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">How to Use</h2>
                        <p className="text-gray-400 text-sm">Guide for Administrators</p>
                    </div>
                </div>
                <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm ml-2">
                    <li>Use the <strong>Prompts Library</strong> to view all current assets.</li>
                    <li>Click <strong>Add New Photo</strong> to upload a new AI generation.</li>
                    <li>Fill in the <strong>Prompt</strong> text and paste the Image URL.</li>
                    <li>Categorize using <strong>Styles</strong> (Cinematic, Realistic, etc.).</li>
                    <li>Changes reflect immediately in the mobile app.</li>
                </ul>
            </div>

            {/* Version Info */}
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">App Version Info</h2>
                        <p className="text-gray-400 text-sm">System Status</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">Admin Panel</p>
                        <p className="font-mono text-white">v0.1.0</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">API Status</p>
                        <p className="font-mono text-green-400">Online</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
