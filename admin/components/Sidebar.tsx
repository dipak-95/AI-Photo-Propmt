'use client';

import { LayoutDashboard, Image as ImageIcon, Settings, LogOut, Plus, User, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        router.push('/');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'All Photos', href: '/dashboard', active: pathname === '/dashboard' && !currentCategory },
        { icon: User, label: 'Men', href: '/dashboard?category=Men', active: currentCategory === 'Men' },
        { icon: Sparkles, label: 'Women', href: '/dashboard?category=Women', active: currentCategory === 'Women' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings', active: pathname === '/dashboard/settings' },
    ];

    return (
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
                    const isActive = item.active;
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
    );
}
