"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Calendar, Layers } from "lucide-react";
import Image from "next/image";
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
}

interface ProjectModalProps {
    project: Project | null;
    onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
    if (!project) return null;

    return (
        <AnimatePresence>
            {project && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[100] bg-[#02040A]/90 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="fixed inset-0 z-[101] overflow-y-auto"
                        initial={{ opacity: 0, scale: 0.95, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 50 }}
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <div className="absolute top-4 right-4 z-50 md:top-8 md:right-8">
                            <button
                                onClick={onClose}
                                className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 transition-all hover:bg-white hover:text-black"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="container-narrow py-20 md:py-32">

                            {/* Header */}
                            <div className="mb-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3 mb-6"
                                >
                                    <span className="px-3 py-1 rounded-full border border-[#3259A8]/30 bg-[#3259A8]/10 text-[#3259A8] font-technical text-[10px]">
                                        {project.status.toUpperCase()}
                                    </span>
                                    {project.metrics && (
                                        <>
                                            <div className="h-1 w-1 bg-[#8A9AB4] rounded-full" />
                                            <span className="font-technical text-[#8A9AB4] text-[10px]">
                                                {project.metrics}
                                            </span>
                                        </>
                                    )}
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="font-editorial text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-[#E8ECF4] mb-6"
                                >
                                    {project.title}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xl md:text-2xl text-[#8A9AB4] font-light max-w-2xl"
                                >
                                    {project.tagline}
                                </motion.p>
                            </div>

                            {/* Main Image */}
                            {project.coverImage && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 mb-16 group"
                                >
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${project.coverImage}`}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 80vw"
                                        priority
                                    />
                                </motion.div>
                            )}

                            {/* Project Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-12 md:gap-20 mb-20">

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="prose prose-invert prose-lg text-[#8A9AB4]"
                                >
                                    {/* Description */}
                                    <div className="whitespace-pre-wrap">{project.description}</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-8"
                                >
                                    {project.liveUrl && (
                                        <div>
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-primary w-full flex items-center justify-center gap-2"
                                            >
                                                Visit Live
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}

                                    {project.techStack && project.techStack.length > 0 && (
                                        <div>
                                            <p className="font-technical text-[#E8ECF4] mb-4">Tech Stack</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.techStack.map(tech => (
                                                    <span key={tech} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-[#8A9AB4]">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-technical text-[#E8ECF4] mb-4">Services</p>
                                        <ul className="space-y-2 text-sm text-[#8A9AB4]">
                                            <li className="flex items-center gap-2">
                                                <Layers className="w-3 h-3 text-[#3259A8]" />
                                                UI/UX Design
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Layers className="w-3 h-3 text-[#3259A8]" />
                                                Full Stack Dev
                                            </li>
                                        </ul>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Gallery */}
                            {project.images && project.images.length > 0 && (
                                <div className="space-y-8">
                                    <p className="font-technical text-center mb-12">Project Gallery</p>
                                    <div className="grid grid-cols-1 gap-8">
                                        {project.images.map((imgId, idx) => (
                                            <motion.div
                                                key={imgId}
                                                initial={{ opacity: 0, y: 50 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="rounded-xl overflow-hidden border border-white/10"
                                            >
                                                <div className="relative aspect-video w-full">
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${imgId}`}
                                                        alt={`Gallery ${idx + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 80vw"
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bottom CTA */}
                            <div className="mt-32 text-center border-t border-white/5 pt-20">
                                <p className="font-technical mb-6">Next Project</p>
                                <button className="font-editorial text-4xl hover:text-[#3259A8] transition-colors">
                                    Book a Discovery Call →
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
