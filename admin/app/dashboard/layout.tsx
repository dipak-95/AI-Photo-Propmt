'use client';

import { LayoutDashboard, Image as ImageIcon, Settings, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        router.push('/');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
        { icon: ImageIcon, label: 'Prompts Library', href: '/dashboard' }, // Same for now
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen flex bg-black text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 fixed h-full glass border-r border-white/10 hidden md:flex flex-col z-20">
                <div className="p-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        <span className="text-gradient">Pearl</span> AI
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Admin Workspace</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-white'}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative">
                {/* Top Navbar Mobile */}
                <div className="md:hidden glass sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
                    <span className="font-bold text-lg">Pearl Admin</span>
                    {/* Add Mobile Menu Toggle Here if needed */}
                </div>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
