"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Briefcase,
    Receipt,
    FileText,
    Settings,
    LogOut
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Finance", href: "/admin/finance", icon: Receipt },
    { name: "Content", href: "/admin/content", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-[#050505] border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-serif font-bold tracking-tight text-white/90">
                    Ephraim OS
                </h1>
                <p className="text-xs text-white/40 mt-1 font-mono">ADMIN PANEL v1.0</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${isActive
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon
                                className={`w-4 h-4 transition-colors ${isActive ? "text-[#00D4FF]" : "text-white/40 group-hover:text-white/80"
                                    }`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <SignOutButton>
                    <button className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
}
