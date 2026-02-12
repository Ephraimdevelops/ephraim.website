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
                    <p className="font-technical mb-6 text-[#3259A8]">CAPABILITIES</p>
                    <h2 className="font-editorial text-4xl md:text-6xl text-[#E8ECF4] max-w-4xl leading-tight">
                        I don&apos;t just build websites.<br />
                        I engineer <span className="italic text-[#8A9AB4]">Digital Ecosystems.</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                    {/* 1. Digital Infrastructure */}
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
                            <h3 className="font-editorial text-3xl text-[#E8ECF4]">Digital Infrastructure</h3>
                            <span className="font-technical text-xs text-[#8A9AB4] border border-[#3259A8]/30 px-2 py-1 rounded-full">The Engine</span>
                        </div>
                        <p className="text-[#8A9AB4] text-lg leading-relaxed mb-6">
                            I build high-performance digital headquarters that run your business while you sleep. No templates. No fragilities. Just bespoke, silicon-valley grade systems designed for speed and scale.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Cinematic Web Platforms",
                                "Custom Business Operating Systems",
                                "Booking Engines & B2B Portals",
                                "Secure NGO Dashboards"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-[#E8ECF4] font-technical">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3259A8]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 2. Business Intelligence */}
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
                            <h3 className="font-editorial text-3xl text-[#E8ECF4]">Business Intelligence</h3>
                            <span className="font-technical text-xs text-[#8A9AB4] border border-[#3259A8]/30 px-2 py-1 rounded-full">The Brain</span>
                        </div>
                        <p className="text-[#8A9AB4] text-lg leading-relaxed mb-6">
                            I deploy autonomous AI agents that handle your repetitive tasks, from customer support to data entry. We turn "manual grunt work" into automated profit.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Custom AI Chatbots & Concierges",
                                "Workflow Automation (Zapier/Make)",
                                "Data Visualization & Reporting",
                                "Smart Lead Capture Systems"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-[#E8ECF4] font-technical">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3259A8]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 3. Brand Authority */}
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
                            <h3 className="font-editorial text-3xl text-[#E8ECF4]">Brand Authority</h3>
                            <span className="font-technical text-xs text-[#8A9AB4] border border-[#3259A8]/30 px-2 py-1 rounded-full">The Face</span>
                        </div>
                        <p className="text-[#8A9AB4] text-lg leading-relaxed mb-6">
                            I craft visual identities that make local businesses look like global giants. Whether it’s a national campaign or a corporate rebrand, I ensure you command respect instantly.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Strategic Corporate Identity",
                                "National Campaign Strategy",
                                "Motion Design & Cinematic Reels",
                                "Investor Pitch Decks"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-[#E8ECF4] font-technical">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3259A8]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 4. Corporate Capability */}
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
                            <h3 className="font-editorial text-3xl text-[#E8ECF4]">Corporate Capability</h3>
                            <span className="font-technical text-xs text-[#8A9AB4] border border-[#3259A8]/30 px-2 py-1 rounded-full">The People</span>
                        </div>
                        <p className="text-[#8A9AB4] text-lg leading-relaxed mb-6">
                            Technology is useless if your team cannot use it. I bridge the skills gap by training your staff to master modern digital tools, ensuring your investment actually pays off.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Staff Digital Training Workshops",
                                "AI Implementation Seminars",
                                "Technical Hiring Support",
                                "Digital Strategy Consultation"
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
