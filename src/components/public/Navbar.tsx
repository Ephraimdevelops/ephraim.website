"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
    { name: "Work", href: "#work" },
    { name: "Services", href: "#services" },
    { name: "About", href: "#about" },
    { name: "Insights", href: "#insights" },
    { name: "Contact", href: "#contact" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // If we are on the home page and the link is an anchor, scroll smoothly
        if (isHome && href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                const offset = 80; // Navbar height
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
                setIsOpen(false);
            }
        }
    };

    return (
        <>
            <motion.nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "py-4" : "py-8"
                    }`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
                <div className="container-wide flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="z-50 relative group">
                        <span className="font-editorial text-2xl text-[#E8ECF4] relative z-10">Ephraim</span>
                        <motion.div
                            className="absolute -inset-4 bg-[#3259A8]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                    </Link>

                    {/* Desktop Scrolled Glass Container OR Mobile Button */}
                    <div className={`
                        flex items-center gap-2
                        ${isScrolled ? "bg-[#060A14]/80 backdrop-blur-md border border-white/5 pr-2 pl-6 py-2 rounded-full" : ""}
                        transition-all duration-500
                    `}>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={isHome ? link.href : `/${link.href.replace('#', '')}`}
                                    onClick={(e) => scrollToSection(e, link.href)}
                                    className="font-technical text-[11px] text-[#8A9AB4] hover:text-[#E8ECF4] transition-colors tracking-widest uppercase cursor-pointer"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* CTA Button (Always visible on Desktop) */}
                        <div className="hidden md:block pl-4 border-l border-white/10">
                            <Link
                                href="/book"
                                className="font-technical text-[10px] bg-[#E8ECF4] text-[#02040A] px-5 py-2.5 rounded-full hover:bg-white hover:scale-105 transition-all duration-300"
                            >
                                Start Project
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden relative z-50 p-2 text-[#E8ECF4] hover:text-[#3259A8] transition-colors"
                        >
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-40 bg-[#02040A] flex flex-col justify-center px-6 md:hidden"
                    >
                        {/* Background Elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#3259A8]/10 rounded-full blur-[100px]" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#3259A8]/5 rounded-full blur-[80px]" />
                        </div>

                        <div className="space-y-8 relative z-10">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                                >
                                    <Link
                                        href={isHome ? link.href : `/${link.href.replace('#', '')}`}
                                        onClick={(e) => scrollToSection(e, link.href)}
                                        className="font-editorial text-5xl text-[#E8ECF4] hover:text-[#3259A8] transition-colors block"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="mt-16 pt-8 border-t border-white/10"
                        >
                            <p className="font-technical text-[#8A9AB4] mb-4">Get in touch</p>
                            <a href="mailto:hello@ephraim.website" className="text-xl text-[#E8ECF4]">hello@ephraim.website</a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
