"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const services = [
    {
        id: "01",
        title: "Strategy",
        description: "We don't guess. We map the terrain. Deep discovery sessions to align your vision with market reality.",
        icon: "🧭",
    },
    {
        id: "02",
        title: "Design",
        description: "Visuals that visceral. We craft identities and interfaces that command attention and build trust instantly.",
        icon: "🎨",
    },
    {
        id: "03",
        title: "Build",
        description: "Engineering that scales. Clean, robust code built for performance, security, and future growth.",
        icon: "⚡",
    },
    {
        id: "04",
        title: "Launch",
        description: "The main event. We orchestrate a seamless rollout to ensure your debut makes waves, not ripples.",
        icon: "🚀",
    },
];

export function CircuitServices() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-[#02040A]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">

                {/* Background Decor */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] bg-[#3259A8]/5 rounded-full blur-[100px]" />
                </div>

                <div className="container-wide relative z-10 w-full">
                    <div className="mb-12 md:mb-20">
                        <p className="font-technical text-[#3259A8] mb-4 tracking-widest uppercase text-xs">The Methodology</p>
                        <h2 className="font-editorial text-5xl md:text-8xl text-[#E8ECF4] leading-[0.9]">
                            Process <br /> <span className="italic text-[#3259A8] opacity-50">in motion.</span>
                        </h2>
                    </div>
                </div>

                <motion.div style={{ x }} className="flex gap-12 md:gap-24 pl-[5vw] md:pl-[20vw]">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="group relative h-[450px] w-[85vw] md:w-[600px] flex-shrink-0 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 transition-colors hover:bg-white/10"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-50 transition-opacity">
                                <span className="text-8xl grayscale">{service.icon}</span>
                            </div>

                            <div>
                                <span className="font-technical text-6xl md:text-8xl text-[#3259A8] opacity-50 block mb-6">
                                    {service.id}
                                </span>
                                <h3 className="font-editorial text-4xl md:text-6xl text-white mb-4">
                                    {service.title}
                                </h3>
                            </div>

                            <div className="relative">
                                <div className="h-px w-full bg-white/20 mb-6" />
                                <p className="font-technical text-[#8A9AB4] text-lg md:text-xl leading-relaxed max-w-sm">
                                    {service.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Progress Bar Bottom */}
                <div className="absolute bottom-12 left-0 right-0 container-wide">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#3259A8]"
                            style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}
