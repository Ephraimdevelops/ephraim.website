"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProjectModal } from "./ProjectModal";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface Project {
    _id: Id<"projects">;
    title: string;
    tagline?: string;
    description: string;
    metrics?: string;
    techStack?: string[];
    liveUrl?: string;
    coverImage?: Id<"_storage">;
    images?: Id<"_storage">[];
    status: string;
    slug: string;
    color?: string; // Optional color override if needed, otherwise default
}

export function PortfolioSection() {
    const projects = useQuery(api.projects.getFeatured);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Loading Skeleton - shown while projects are undefined
    // useScroll must NOT be called here because the containerRef element doesn't exist yet
    if (!projects) {
        return (
            <section className="relative bg-[#02040A] h-screen flex items-center justify-center">
                <div className="flex gap-8 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[60vh] w-[45vw] bg-white/5 rounded-lg animate-pulse border border-white/10" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <PortfolioContent
            projects={projects as Project[]}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
        />
    );
}

// Inner component that only mounts when projects are available.
// This is critical: useScroll({ target }) requires the ref element to exist in the DOM.
// By only rendering this component when we have data, the ref is always attached.
function PortfolioContent({
    projects,
    selectedProject,
    setSelectedProject,
}: {
    projects: Project[];
    selectedProject: Project | null;
    setSelectedProject: (p: Project | null) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const scrollRange = projects.length > 1 ? `-${(projects.length - 1) * 60}%` : "0%";
    const x = useTransform(scrollYProgress, [0, 1], ["0%", scrollRange]);

    return (
        <section ref={containerRef} className="relative bg-[#02040A] md:h-[300vh]">

            {/* ─── DESKTOP: STICKY HORIZONTAL SCROLL ─── */}
            <div className="hidden md:sticky md:top-0 md:flex md:h-screen md:items-center md:overflow-hidden">

                {/* Header / Counter */}
                <div className="absolute top-32 left-8 z-20 mix-blend-difference text-white">
                    <p className="font-technical mb-2">Selected Works</p>
                    <div className="font-technical text-[#3259A8]">
                        {String(projects.length).padStart(2, "0")} Projects
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-12 left-8 z-20 w-64 mix-blend-difference">
                    <div className="h-[1px] w-full bg-white/20">
                        <motion.div
                            className="h-full bg-white"
                            style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                        />
                    </div>
                </div>

                {/* The Track */}
                <motion.div
                    className="flex gap-20 pl-[20vw] items-center"
                    style={{ x }}
                >
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            index={index}
                            onClick={() => setSelectedProject(project)}
                        />
                    ))}

                    {/* CTA Card at the end */}
                    <div className="relative h-[60vh] w-[40vw] shrink-0 flex items-center justify-center">
                        <div className="text-center group cursor-pointer">
                            <h3 className="font-editorial text-5xl mb-6 text-white group-hover:scale-110 transition-transform duration-700">
                                Yours <span className="italic text-[#3259A8]">Next?</span>
                            </h3>
                            <Link href="/book" className="inline-flex items-center gap-2 font-technical text-white/60 hover:text-white transition-colors">
                                Start a Conversation <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ─── MOBILE: VERTICAL STACK ─── */}
            <div className="md:hidden py-24 px-6 space-y-24">
                <div className="mb-12">
                    <p className="font-technical mb-2 text-[#8A9AB4]">Selected Works</p>
                    <h2 className="font-editorial text-4xl text-[#E8ECF4]">Featured <span className="italic text-[#3259A8]">Case Studies</span></h2>
                </div>

                {projects.map((project, index) => (
                    <MobileProjectCard
                        key={project._id}
                        project={project}
                        index={index}
                        onClick={() => setSelectedProject(project)}
                    />
                ))}

                <div className="text-center py-20 border-t border-white/5">
                    <Link href="/book" className="btn-primary w-full block text-center py-4">
                        Start Your Project
                    </Link>
                </div>
            </div>

            {/* Project Details Modal */}
            <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />

        </section>
    );
}

function ProjectCard({ project, index, onClick }: { project: Project, index: number, onClick: () => void }) {
    return (
        <motion.div
            className="group relative h-[60vh] w-[45vw] shrink-0 cursor-pointer"
            onClick={onClick}
            whileHover={{ y: -20 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
            {/* Image Container */}
            <div className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 bg-[#060A14]">
                {project.coverImage ? (
                    <Image
                        src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${project.coverImage}`}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100"
                        sizes="(max-width: 768px) 100vw, 45vw"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0B101B] to-[#02040A]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-transparent to-transparent opacity-80" />
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
                <span className="font-technical text-[#3259A8] mb-4 block">0{index + 1}</span>
                <h3 className="font-editorial text-4xl md:text-5xl text-[#E8ECF4] mb-2 leading-none group-hover:translate-x-2 transition-transform duration-500">
                    {project.title}
                </h3>
                <p className="text-[#8A9AB4] font-light text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {project.tagline}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-[#E8ECF4] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <span className="border-b border-white/20 pb-0.5">View Case Study</span>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
}

function MobileProjectCard({ project, index, onClick }: { project: Project, index: number, onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8 }}
            onClick={onClick}
            className="relative aspect-[4/5] w-full rounded-xl overflow-hidden border border-white/10 bg-[#060A14]"
        >
            {project.coverImage ? (
                <Image
                    src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${project.coverImage}`}
                    alt={project.title}
                    fill
                    className="object-cover opacity-70"
                    sizes="100vw"
                />
            ) : (
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#0B101B] to-[#02040A]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-[#02040A]/50 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <span className="font-technical text-[#3259A8] mb-2 block text-xs">0{index + 1}</span>
                <h3 className="font-editorial text-3xl text-[#E8ECF4] mb-2">{project.title}</h3>
                <p className="text-[#8A9AB4] text-sm mb-4 line-clamp-2">{project.tagline}</p>
                <span className="text-xs font-technical text-white border border-white/10 px-3 py-1.5 rounded-full bg-white/5">
                    View Details
                </span>
            </div>
        </motion.div>
    )
}
