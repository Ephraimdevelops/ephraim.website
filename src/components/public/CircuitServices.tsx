"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const services = [
    {
        id: "strategy",
        number: "01",
        title: "Strategy",
        description: "Deep-dive discovery sessions to understand your goals, audience, and market position. We craft a roadmap that aligns vision with execution.",
        deliverables: ["Brand Audit", "User Research", "Competitive Analysis", "Roadmap"],
    },
    {
        id: "design",
        number: "02",
        title: "Design",
        description: "Visual systems that command attention. From brand identity to interface design, every pixel is crafted to convert visitors into believers.",
        deliverables: ["Brand Identity", "UI/UX Design", "Design Systems", "Prototypes"],
    },
    {
        id: "development",
        number: "03",
        title: "Code",
        description: "Blazing-fast applications built with modern technology. Performance-optimized, SEO-ready, and designed to scale with your ambitions.",
        deliverables: ["Frontend Development", "CMS Integration", "API Development", "Deployment"],
    },
    {
        id: "launch",
        number: "04",
        title: "Launch",
        description: "Strategic launch planning to maximize impact. We ensure your digital presence makes waves from day one.",
        deliverables: ["Launch Strategy", "Analytics Setup", "Performance Audit", "Handover"],
    },
];

/**
 * CircuitServices - Scrollytelling with SVG Path Animation
 * 
 * Features:
 * - Glowing "Liquid Silver" line draws as you scroll
 * - Line connects service nodes like a circuit board
 * - Nodes light up when active
 * - Lightweight SVG instead of heavy 3D
 */
export function CircuitServices() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // Path drawing animation
    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <section
            ref={containerRef}
            className="relative bg-[#060A14] py-32 overflow-hidden"
        >
            {/* Section Header */}
            <div className="container-wide mb-20">
                <p className="font-technical mb-4">The Process</p>
                <h2 className="font-editorial text-display max-w-2xl">
                    From vision to <span className="italic">reality</span>
                </h2>
            </div>

            {/* The Circuit */}
            <div className="relative container-wide">
                {/* SVG Circuit Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block">
                    <svg
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-8"
                        viewBox="0 0 32 1000"
                        preserveAspectRatio="none"
                    >
                        {/* Background line (dim) */}
                        <path
                            d="M16 0 L16 1000"
                            stroke="rgba(50, 89, 168, 0.1)"
                            strokeWidth="2"
                            fill="none"
                        />

                        {/* Animated glowing line */}
                        <motion.path
                            d="M16 0 L16 1000"
                            stroke="url(#circuitGradient)"
                            strokeWidth="2"
                            fill="none"
                            style={{
                                pathLength,
                                filter: "drop-shadow(0 0 8px rgba(50, 89, 168, 0.5))",
                            }}
                        />

                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3259A8" />
                                <stop offset="50%" stopColor="#E8ECF4" />
                                <stop offset="100%" stopColor="#3259A8" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Service Cards */}
                <div className="space-y-32">
                    {services.map((service, index) => (
                        <ServiceNode
                            key={service.id}
                            service={service}
                            index={index}
                            progress={scrollYProgress}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface ServiceNodeProps {
    service: (typeof services)[0];
    index: number;
    progress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function ServiceNode({ service, index }: ServiceNodeProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: nodeProgress } = useScroll({
        target: nodeRef,
        offset: ["start end", "center center"],
    });

    // Node glow when active
    const glow = useTransform(
        nodeProgress,
        [0, 0.5, 1],
        [
            "0 0 0px rgba(50, 89, 168, 0)",
            "0 0 40px rgba(50, 89, 168, 0.6)",
            "0 0 20px rgba(50, 89, 168, 0.3)",
        ]
    );

    const isLeft = index % 2 === 0;

    return (
        <div
            ref={nodeRef}
            className={`relative grid md:grid-cols-2 gap-8 items-center ${isLeft ? "" : "md:[direction:rtl]"
                }`}
        >
            {/* The Node (Center point) */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#3259A8] z-10 hidden md:block"
                style={{ boxShadow: glow }}
            />

            {/* Content */}
            <motion.div
                className={`${isLeft ? "md:pr-16 md:text-right" : "md:pl-16 md:[direction:ltr]"}`}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <span className="font-technical text-[#3259A8] mb-4 block">
                    {service.number}
                </span>
                <h3 className="font-editorial text-4xl md:text-5xl mb-4 text-[#E8ECF4]">
                    {service.title}
                </h3>
                <p className="text-[#8A9AB4] leading-relaxed max-w-md mb-6">
                    {service.description}
                </p>

                {/* Deliverables */}
                <div className={`flex flex-wrap gap-2 ${isLeft ? "md:justify-end" : ""}`}>
                    {service.deliverables.map((item) => (
                        <span
                            key={item}
                            className="glass px-3 py-1 rounded-full text-xs text-[#8A9AB4]"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </motion.div>

            {/* Visual (opposite side) */}
            <motion.div
                className={`relative aspect-square max-w-md ${isLeft ? "md:pl-16" : "md:pr-16 md:[direction:ltr]"
                    }`}
                initial={{ opacity: 0, x: isLeft ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-[#3259A8]/10 to-transparent border border-[#3259A8]/10 flex items-center justify-center">
                    {/* Abstract icon */}
                    <motion.div
                        className="text-8xl opacity-20"
                        animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.02, 0.98, 1],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {index === 0 && "◈"}
                        {index === 1 && "✦"}
                        {index === 2 && "⚡"}
                        {index === 3 && "→"}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
