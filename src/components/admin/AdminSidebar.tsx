"use client";

import { useState, useEffect } from "react";
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
    LogOut,
    Menu,
    X
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Invoices", href: "/admin/invoices", icon: Receipt },
    { name: "Finance", href: "/admin/finance", icon: Receipt },
    { name: "Content", href: "/admin/content", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-serif font-bold tracking-tight text-white/90">
                        Ephraim OS
                    </h1>
                    <p className="text-xs text-white/40 mt-1 font-mono">ADMIN PANEL v1.0</p>
                </div>
                {/* Close Button for Mobile */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden p-2 text-white/60 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
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
        </>
    );

    return (
        <>
            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#050505] border-b border-white/10 z-50 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 -ml-2 text-white/60 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-serif font-bold text-white">Ephraim OS</span>
                </div>
            </div>

            {/* DESKTOP SIDEBAR - Hidden on Mobile */}
            <aside className="hidden md:flex w-64 h-screen bg-[#050505] border-r border-white/10 flex-col fixed left-0 top-0 z-50">
                <SidebarContent />
            </aside>

            {/* MOBILE DRAWER */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
                        />
                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-64 bg-[#050505] border-r border-white/10 z-[70] flex flex-col md:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
