"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { ProjectModal } from "./ProjectModal";
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
}

export function WorkGallery() {
    const projects = useQuery(api.projects.list, {});
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    if (projects === undefined) {
        return (
            <section className="bg-[#02040A] min-h-screen py-32 px-6">
                <div className="container-wide">
                    <div className="mb-20 animate-pulse">
                        <div className="h-20 w-1/2 bg-white/5 rounded-lg mb-6" />
                        <div className="h-6 w-1/3 bg-white/5 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/3] bg-white/5 rounded-xl mb-6 border border-white/10" />
                                <div className="flex justify-between">
                                    <div className="space-y-2 w-1/2">
                                        <div className="h-8 bg-white/5 rounded" />
                                        <div className="h-4 w-2/3 bg-white/5 rounded" />
                                    </div>
                                    <div className="h-6 w-8 bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-[#02040A] min-h-screen py-32 px-6">
            <div className="container-wide">
                <div className="mb-20">
                    <h1 className="font-editorial text-6xl md:text-8xl text-[#E8ECF4] mb-6">
                        Selected <span className="italic text-[#3259A8]">Works</span>
                    </h1>
                    <p className="text-[#8A9AB4] font-light text-xl max-w-2xl">
                        A curated collection of digital experiences, products, and brands forged with precision and passion.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
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
            </div>

            <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </section>
    );
}
