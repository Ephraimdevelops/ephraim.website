"use client";

import { motion } from "framer-motion";
import { Cpu, Brain, Zap, Users } from "lucide-react";

export function ServicesSection() {
    return (
        <section id="services" className="relative z-10 border-t border-[#3259A8]/10 bg-[#02040A] py-32 overflow-hidden">
            <div className="container-wide">
                <motion.div
                    className="mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <p className="font-technical mb-6 text-[#3259A8]">WHAT I DO</p>
                    <h2 className="font-editorial text-4xl md:text-6xl text-[#E8ECF4] max-w-4xl leading-tight">
                        I don&apos;t just build websites.<br />
                        I build <span className="italic text-[#8A9AB4]">Digital Businesses.</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                    {/* 1. Websites & Systems (Formerly Digital Infrastructure) */}
                    <motion.div
                        className="group"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <span className="p-3 rounded-full bg-[#3259A8]/10 text-[#3259A8] group-hover:bg-[#3259A8] group-hover:text-white transition-colors">
                                <Cpu className="w-6 h-6" />
                            </span>
                            <h3 className="font-editorial text-3xl text-[#E8ECF4]">Websites & Systems</h3>
                            <span className="font-technical text-xs text-[#8A9AB4] border border-[#3259A8]/30 px-2 py-1 rounded-full">The Engine</span>
                        </div>
                        <p className="text-[#8A9AB4] text-lg leading-relaxed mb-6">
                            I build fast, beautiful websites and systems that run your business while you sleep. No broken templates. Just high-quality tools designed to grow with you.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Modern Websites",
                                "Business Management Systems",
                                "Booking portals",
                                "Secure Dashboards"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-[#E8ECF4] font-technical">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3259A8]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 2. AI & Automation (Formerly Business Intelligence) */}
                    <motion.div
                        className="group"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <span className="p-3 rounded-full bg-[#3259A8]/10 text-[#3259A8] group-hover:bg-[#3259A8] group-hover:text-white transition-colors">
                                <Brain className="w-6 h-6" />
                            </span>
                            <h3 className="font-editorial text-3xl text-[#E8ECF4]">AI & Automation</h3>
                            <span className="font-technical text-xs text-[#8A9AB4] border border-[#3259A8]/30 px-2 py-1 rounded-full">The Brain</span>
                        </div>
                        <p className="text-[#8A9AB4] text-lg leading-relaxed mb-6">
                            I set up smart AI assistants that handle repetitive tasks for you. From answering customer questions to data entry, we turn boring work into automatic profit.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Custom AI Chatbots",
                                "Work Automation",
                                "Data Reporting",
                                "Smart Lead Collection"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-[#E8ECF4] font-technical">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3259A8]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 3. Branding & Design (Formerly Brand Authority) */}
                    <motion.div
                        className="group"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <span className="p-3 rounded-full bg-[#3259A8]/10 text-[#3259A8] group-hover:bg-[#3259A8] group-hover:text-white transition-colors">
                                <Zap className="w-6 h-6" />
                            </span>
                            <h3 className="font-editorial text-3xl text-[#E8ECF4]">Branding & Design</h3>
                            <span className="font-technical text-xs text-[#8A9AB4] border border-[#3259A8]/30 px-2 py-1 rounded-full">The Face</span>
                        </div>
                        <p className="text-[#8A9AB4] text-lg leading-relaxed mb-6">
                            I design brands that make local businesses look like global giants. Whether it’s a new logo or a full company makeover, I make sure you look professional and trustworthy.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Logo & Identity",
                                "Marketing Strategy",
                                "Video & Animation",
                                "Pitch Decks"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-[#E8ECF4] font-technical">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3259A8]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 4. Training (Formerly Corporate Capability) */}
                    <motion.div
                        className="group"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <span className="p-3 rounded-full bg-[#3259A8]/10 text-[#3259A8] group-hover:bg-[#3259A8] group-hover:text-white transition-colors">
                                <Users className="w-6 h-6" />
                            </span>
                            <h3 className="font-editorial text-3xl text-[#E8ECF4]">Training & Support</h3>
                            <span className="font-technical text-xs text-[#8A9AB4] border border-[#3259A8]/30 px-2 py-1 rounded-full">The People</span>
                        </div>
                        <p className="text-[#8A9AB4] text-lg leading-relaxed mb-6">
                            Technology is useless if your team cannot use it. I teach your staff how to use modern digital tools, ensuring your investment actually pays off.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Staff Training",
                                "AI Workshops",
                                "Tech Hiring Help",
                                "Digital Strategy"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-[#E8ECF4] font-technical">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3259A8]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
