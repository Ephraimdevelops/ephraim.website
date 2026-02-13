"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { ProjectModal } from "./ProjectModal";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

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
    category?: string;
}

const CATEGORIES = ["All", "Websites", "Apps", "Branding", "Systems"];

export function WorkGallery() {
    const [activeCategory, setActiveCategory] = useState("All");

    // We fetch all projects and filter client-side for smoother transitions
    // Alternatively, we could pass args to the query: { category: activeCategory === "All" ? undefined : activeCategory }
    const projects = useQuery(api.projects.list, activeCategory === "All" ? {} : { category: activeCategory });
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    return (
        <section className="bg-[#02040A] min-h-screen py-32 px-6">
            <div className="container-wide">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div>
                        <h1 className="font-editorial text-6xl md:text-8xl text-[#E8ECF4] mb-6">
                            Selected <span className="italic text-[#3259A8]">Works</span>
                        </h1>
                        <p className="text-[#8A9AB4] font-light text-xl max-w-2xl">
                            A curated collection of digital experiences, products, and brands forged with precision and passion.
                        </p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-full font-technical text-sm transition-all duration-300 border",
                                    activeCategory === cat
                                        ? "bg-[#3259A8] border-[#3259A8] text-white"
                                        : "bg-transparent border-white/10 text-[#8A9AB4] hover:text-white hover:border-white/30"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {projects === undefined ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i}>
                                <div className="aspect-[4/3] bg-white/5 rounded-xl mb-6 border border-white/10" />
                                <div className="space-y-4">
                                    <div className="h-8 w-2/3 bg-white/5 rounded" />
                                    <div className="h-4 w-1/2 bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-32 border border-white/10 rounded-xl border-dashed">
                        <p className="font-technical text-[#8A9AB4]">No projects found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project._id}
                                layoutId={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                onClick={() => setSelectedProject(project as any)}
                                className="group cursor-pointer"
                            >
                                {/* Image Aspect Ratio Container */}
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#060A14] mb-6">
                                    {project.coverImage ? (
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${project.coverImage}`}
                                            alt={project.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#0B101B] to-[#02040A]" />
                                    )}

                                    {/* Overlay Tags */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {project.category && (
                                            <span className="px-2 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded text-[10px] font-technical text-white uppercase tracking-wider">
                                                {project.category}
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute inset-0 bg-[#02040A]/20 group-hover:bg-transparent transition-colors duration-500" />
                                </div>

                                {/* Content */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-editorial text-3xl text-[#E8ECF4] mb-2 group-hover:text-[#3259A8] transition-colors">
                                            {project.title}
                                        </h3>
                                        <p className="text-[#8A9AB4] text-sm font-technical uppercase tracking-wider">
                                            {project.tagline || "Digital Experience"}
                                        </p>
                                    </div>
                                    <span className="font-technical text-white/30 text-xs border border-white/10 px-2 py-1 rounded">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </section>
    );
}
