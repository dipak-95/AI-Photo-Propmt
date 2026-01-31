'use client';

import Sidebar from '@/components/Sidebar';
import { Suspense } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-black text-gray-100 font-sans">
            {/* Sidebar with Suspense */}
            <Suspense fallback={<aside className="w-64 fixed h-full glass border-r border-white/10 hidden md:flex flex-col z-20" />}>
                <Sidebar />
            </Suspense>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative">
                {/* Top Navbar Mobile */}
                <div className="md:hidden glass sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
                    <span className="font-bold text-lg">Pearl Admin</span>
                </div>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
