"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Briefcase,
    Receipt,
    FileText,
    Fingerprint,
    LogOut,
    Menu,
    X,
    Wallet,
    CreditCard,
    BarChart3,
    UserCircle,
    ListTodo,
    Timer,
    Sparkles,
    Share2,
    Palmtree,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// Navigation grouped by Business Function (Mental Model)
// ═══════════════════════════════════════════════════════════════
type NavItem = { name: string; href: string; icon: any };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
    {
        label: "",
        items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ],
    },
    {
        label: "Operations",
        items: [
            { name: "Clients", href: "/admin/clients", icon: Users },
            { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
            { name: "Projects", href: "/admin/projects", icon: Briefcase },
            { name: "Tasks", href: "/admin/tasks", icon: ListTodo },
        ],
    },
    {
        label: "Treasury",
        items: [
            { name: "Finance", href: "/admin/finance", icon: BarChart3 },
            { name: "Invoices", href: "/admin/invoices", icon: Receipt },
            { name: "Payments", href: "/admin/payments", icon: CreditCard },
            { name: "Expenses", href: "/admin/expenses", icon: Wallet },
        ],
    },
    {
        label: "Human Capital",
        items: [
            { name: "Team", href: "/admin/employees", icon: UserCircle },
            { name: "Time", href: "/admin/time", icon: Timer },
            { name: "Leave", href: "/admin/leave", icon: Palmtree },
        ],
    },
    {
        label: "Intelligence & Media",
        items: [
            { name: "AI Studio", href: "/admin/ai-studio", icon: Sparkles },
            { name: "Content", href: "/admin/content", icon: FileText },
            { name: "Social", href: "/admin/content/social", icon: Share2 },
        ],
    },
];

const systemItems: NavItem[] = [
    { name: "Brand DNA", href: "/admin/settings", icon: Fingerprint },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const settings = useQuery(api.settings.get);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname === href || pathname?.startsWith(href + "/");
    };

    const NavLink = ({ item }: { item: NavItem }) => {
        const active = isActive(item.href);
        return (
            <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${active
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                    }`}
            >
                <item.icon className={`w-4 h-4 transition-colors ${active ? "text-white" : "text-white/30 group-hover:text-white/60"}`} />
                {item.name}
            </Link>
        );
    };

    const SidebarContent = () => (
        <>
            {/* Brand */}
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {settings?.logoUrl ? (
                        <img src={settings.logoUrl} alt="" className="w-7 h-7 rounded-lg object-contain" />
                    ) : (
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                            {settings?.businessName?.charAt(0) || "E"}
                        </div>
                    )}
                    <div>
                        <h1 className="text-sm font-serif font-bold tracking-[-0.04em] text-white/90">
                            Ephraim OS
                        </h1>
                        <p className="text-[9px] text-white/20 font-mono tracking-widest uppercase">Operating System</p>
                    </div>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-2 text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
                {navGroups.map((group, i) => (
                    <div key={i}>
                        {group.label && (
                            <div className="px-3 mb-2 text-[10px] font-medium text-white/20 uppercase tracking-[0.12em]">
                                {group.label}
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavLink key={item.href} item={item} />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* System — pinned bottom */}
            <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5">
                {systemItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
                <SignOutButton>
                    <button className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-[13px] text-white/30 hover:bg-red-500/5 hover:text-red-400 transition-all">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </SignOutButton>
            </div>
        </>
    );

    return (
        <>
            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.06] z-50 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 -ml-2 text-white/40 hover:text-white">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-serif font-bold text-white/90 text-sm">Ephraim OS</span>
                </div>
            </div>

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex w-60 h-screen bg-[#050505] border-r border-white/[0.06] flex-col fixed left-0 top-0 z-50">
                <SidebarContent />
            </aside>

            {/* MOBILE DRAWER */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-60 bg-[#050505] border-r border-white/[0.06] z-[70] flex flex-col md:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
