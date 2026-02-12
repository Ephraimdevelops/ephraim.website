"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

export function InsightsSection() {
    const posts = useQuery(api.posts.list, { status: "published" });
    const recentPosts = posts?.slice(0, 3);

    return (
        <section className="relative z-10 border-t border-[#3259A8]/10 bg-[#060A14] py-32">
            <div className="container-wide">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="font-technical mb-6 text-[#3259A8]">Insights</p>
                        <h2 className="font-editorial text-4xl md:text-6xl text-[#E8ECF4]">
                            Thoughts on <span className="italic">Software</span><br />
                            & <span className="italic">Design</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Link href="/thoughts" className="group flex items-center gap-4 text-[#E8ECF4] hover:text-white transition-colors">
                            <span className="font-technical text-sm">View all articles</span>
                            <span className="border border-[#3259A8]/30 rounded-full p-3 group-hover:bg-[#3259A8] group-hover:border-[#3259A8] transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    </motion.div>
                </div>

                {!recentPosts ? (
                    // Skeleton
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[400px] bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {recentPosts.map((post, index) => (
                            <Link key={post._id} href={`/thoughts/${post.slug}`}>
                                <motion.article
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className="group relative h-full flex flex-col"
                                >
                                    {/* Image Card */}
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/5 bg-[#02040A]">
                                        {post.coverImage ? (
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${post.coverImage}`}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#0B101B] to-[#02040A]" />
                                        )}

                                        {/* Date Badge */}
                                        <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-[#3259A8]" />
                                            <span className="font-technical text-[10px] text-[#E8ECF4]">
                                                {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "Draft"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="font-editorial text-2xl text-[#E8ECF4] mb-3 group-hover:text-white transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-[#8A9AB4] text-sm leading-relaxed mb-6 line-clamp-3">
                                            {post.excerpt || "Read more about this topic..."}
                                        </p>

                                        <div className="mt-auto flex items-center gap-2 text-sm text-[#3259A8] font-technical group-hover:gap-4 transition-all">
                                            Read Article <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </motion.article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
