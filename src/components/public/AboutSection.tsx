"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function AboutSection() {
    return (
        <section className="relative z-10 border-t border-[#3259A8]/10 bg-[#02040A] py-32 overflow-hidden">
            <div className="container-wide grid md:grid-cols-2 gap-16 items-center">

                {/* Image / Visual */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                    className="relative aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[#3259A8]/10 z-10 mix-blend-overlay" />
                    {/* Placeholder for portrait - using a gradient for now */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0B101B] to-[#02040A]" />

                    {/* Decorative elements */}
                    <div className="absolute top-8 left-8 right-8 bottom-8 border border-white/10 rounded-xl z-20" />
                    <div className="absolute bottom-12 left-12 z-20">
                        <p className="font-technical text-xs text-[#3259A8] mb-1">FOUNDER & LEAD DESIGNER</p>
                        <p className="font-editorial text-3xl text-white">Ephraim Ndangowi</p>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
                >
                    <p className="font-technical mb-6 text-[#3259A8]">The Philosophy</p>
                    <h2 className="font-editorial text-4xl md:text-5xl text-[#E8ECF4] mb-8 leading-tight">
                        Design is not just what it looks like.<br />
                        <span className="italic text-[#8A9AB4]">It's how it works.</span>
                    </h2>

                    <div className="space-y-6 text-[#8A9AB4] leading-relaxed text-lg">
                        <p>
                            In a digital landscape cluttered with noise, I build signals. My work exists at the intersection of technical precision and cinematic storytelling—creating experiences that aren't just visited, but felt.
                        </p>
                        <p>
                            I partner with ambitious brands to forge digital empires. From the first line of code to the final pixel polish, every decision is intentional, every interaction is calculated, and the result is nothing short of world-class.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-8">
                        <div>
                            <p className="font-editorial text-3xl text-white mb-2">100k+</p>
                            <p className="font-technical text-xs text-[#8A9AB4]">REVENUE GENERATED FOR CLIENTS</p>
                        </div>
                        <div>
                            <p className="font-editorial text-3xl text-white mb-2">Global</p>
                            <p className="font-technical text-xs text-[#8A9AB4]">CLIENT BASE ACROSS 3 CONTINENTS</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
