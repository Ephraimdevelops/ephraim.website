"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

// Mock project data (will fetch from Convex later)
const projects = [
    {
        id: "1",
        title: "Fintech Revolution",
        tagline: "The Financial OS for African Diaspora",
        slug: "fintech-revolution",
        metrics: "+340% User Growth",
        image: "/projects/project-1.jpg",
        color: "#1a365d",
    },
    {
        id: "2",
        title: "Luxury E-Commerce",
        tagline: "High-End Fashion Marketplace",
        slug: "luxury-ecommerce",
        metrics: "$2.4M Revenue",
        image: "/projects/project-2.jpg",
        color: "#2d3748",
    },
    {
        id: "3",
        title: "Health Platform",
        tagline: "Telemedicine for Rural Tanzania",
        slug: "health-platform",
        metrics: "50K+ Consultations",
        image: "/projects/project-3.jpg",
        color: "#1a202c",
    },
    {
        id: "4",
        title: "EdTech Innovation",
        tagline: "Learning Management System",
        slug: "edtech-innovation",
        metrics: "100K Students",
        image: "/projects/project-4.jpg",
        color: "#171923",
    },
];

/**
 * HorizontalGallery - Sticky Scroll with Parallax
 * 
 * Features:
 * - Section pins while scrolling
 * - Vertical scroll translates to horizontal movement
 * - Parallax: Text moves at -100%, Images at -80%
 * - Reveal animations on each card
 */
export function HorizontalGallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Transform vertical scroll to horizontal translation
    // Move from 0% to -75% (showing 4 projects)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    return (
        <section
            ref={containerRef}
            className="relative bg-[#02040A] md:h-[400vh]" // Height is only for desktop sticky scroll
        >
            {/* ─── DESKTOP: STICKY HORIZONTAL SCROLL ─── */}
            <div className="hidden md:sticky md:top-0 md:flex md:h-screen md:items-center md:overflow-hidden">
                {/* Header */}
                <div className="absolute top-8 left-8 z-20">
                    <p className="font-technical mb-2">Selected Works</p>
                    <div className="flex items-center gap-4">
                        <span className="font-technical text-[#3259A8]">
                            {String(projects.length).padStart(2, "0")} Projects
                        </span>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="absolute bottom-8 left-8 z-20 w-40">
                    <div className="h-[1px] w-full bg-[#3259A8]/20">
                        <motion.div
                            className="h-full bg-[#3259A8]"
                            style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                        />
                    </div>
                    <div className="mt-2 flex justify-between">
                        <span className="font-technical text-[10px]">01</span>
                        <span className="font-technical text-[10px]">
                            {String(projects.length).padStart(2, "0")}
                        </span>
                    </div>
                </div>

                {/* Horizontal scrolling content */}
                <motion.div
                    className="flex gap-8 pl-[10vw]"
                    style={{ x }}
                >
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            index={index}
                            progress={scrollYProgress}
                        />
                    ))}

                    {/* CTA Card */}
                    <div className="flex h-[70vh] w-[60vw] shrink-0 items-center justify-center">
                        <div className="text-center">
                            <p className="font-technical mb-4">Seen enough?</p>
                            <h3 className="font-editorial text-4xl mb-6">
                                Let&apos;s create <span className="italic">yours</span>
                            </h3>
                            <Link href="/book" className="btn-primary">
                                Start a Project
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ─── MOBILE: VERTICAL STACK ─── */}
            <div className="md:hidden flex flex-col gap-12 py-20 px-6">
                <div className="mb-8">
                    <p className="font-technical mb-2">Selected Works</p>
                    <span className="font-technical text-[#3259A8]">
                        {String(projects.length).padStart(2, "0")} Projects
                    </span>
                </div>

                {projects.map((project, index) => (
                    <MobileProjectCard key={project.id} project={project} index={index} />
                ))}

                {/* Mobile CTA */}
                <div className="text-center py-20">
                    <h3 className="font-editorial text-4xl mb-6">
                        Let&apos;s create <span className="italic">yours</span>
                    </h3>
                    <Link href="/book" className="btn-primary w-full block text-center">
                        Start a Project
                    </Link>
                </div>
            </div>
        </section>
    );
}

interface ProjectCardProps {
    project: (typeof projects)[0];
    index: number;
    progress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function ProjectCard({ project, index }: ProjectCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Individual card scroll progress
    const { scrollYProgress: cardProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"],
    });

    // Parallax transforms - Text moves faster than image
    const textX = useTransform(cardProgress, [0, 1], ["20%", "-20%"]);
    const imageX = useTransform(cardProgress, [0, 1], ["10%", "-10%"]);
    const imageScale = useTransform(cardProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

    return (
        <Link
            href={`/work/${project.slug}`}
            className="group block"
            data-cursor="View"
        >
            <motion.div
                ref={cardRef}
                className="relative h-[70vh] w-[60vw] shrink-0 overflow-hidden rounded-xl"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
                viewport={{ once: true }}
            >
                {/* Background gradient */}
                <div
                    className="absolute inset-0 z-0"
                    style={{ backgroundColor: project.color }}
                />

                {/* Image with parallax */}
                <motion.div
                    className="absolute inset-0 z-10"
                    style={{ x: imageX, scale: imageScale }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-transparent to-transparent z-10" />
                    {/* Placeholder image - gradient fallback */}
                    <div className="h-full w-full bg-gradient-to-br from-[#3259A8]/20 to-transparent" />
                </motion.div>

                {/* Content with parallax (moves faster) */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12"
                    style={{ x: textX }}
                >
                    {/* Index number */}
                    <span className="font-technical text-[#3259A8] mb-4 block">
                        {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Title */}
                    <h3 className="font-editorial text-4xl md:text-5xl mb-2 text-[#E8ECF4] group-hover:text-white transition-colors duration-500">
                        {project.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-[#8A9AB4] text-lg mb-4">
                        {project.tagline}
                    </p>

                    {/* Metrics */}
                    <div className="flex items-center gap-4">
                        <span className="font-technical text-[#3259A8]">
                            {project.metrics}
                        </span>
                        <div className="h-4 w-[1px] bg-[#3259A8]/30" />
                        <span className="font-technical text-[10px] text-[#8A9AB4] group-hover:text-[#3259A8] transition-colors duration-500">
                            View Case Study →
                        </span>
                    </div>
                </motion.div>

                {/* Hover overlay */}
                <motion.div
                    className="absolute inset-0 z-15 bg-[#3259A8]/0 transition-colors duration-500 group-hover:bg-[#3259A8]/10"
                />
            </motion.div>
        </Link>
    );
}

function MobileProjectCard({ project, index }: { project: (typeof projects)[0], index: number }) {
    return (
        <Link href={`/work/${project.slug}`} className="block">
            <motion.div
                className="relative aspect-[4/5] w-full overflow-hidden rounded-xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
                viewport={{ once: true, margin: "-50px" }}
            >
                <div className="absolute inset-0 z-0" style={{ backgroundColor: project.color }} />

                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#02040A] via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                    <span className="font-technical text-[#3259A8] mb-2 block text-xs">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-editorial text-3xl mb-2 text-[#E8ECF4]">
                        {project.title}
                    </h3>
                    <p className="text-[#8A9AB4] text-sm mb-3">
                        {project.tagline}
                    </p>
                    <span className="font-technical text-xs text-[#3259A8]">
                        {project.metrics}
                    </span>
                </div>
            </motion.div>
        </Link>
    );
}
