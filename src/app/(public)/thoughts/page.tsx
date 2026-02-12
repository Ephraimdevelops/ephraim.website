"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { useState } from "react";

export default function ThoughtsPage() {
    const allPosts = useQuery(api.posts.list, { status: "published" });
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    if (allPosts === undefined) {
        return (
            <div className="min-h-screen bg-[#050505] text-[#EDEDED] flex items-center justify-center">
                <div className="animate-pulse text-white/40">Loading thoughts...</div>
            </div>
        );
    }

    const categories = Array.from(new Set(allPosts.map(p => p.category || "thought")));
    const filteredPosts = selectedCategory
        ? allPosts.filter(p => (p.category || "thought") === selectedCategory)
        : allPosts;

    return (
        <div className="min-h-screen bg-[#050505] text-[#EDEDED] selection:bg-[#3259A8] selection:text-white">

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
                    Thoughts & <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Case Studies
                    </span>
                </h1>
                <p className="text-xl text-white/60 max-w-2xl font-light leading-relaxed">
                    Musings on design, engineering, and the future of software.
                    A collection of technical deep dives and strategic insights.
                </p>
            </section>

            {/* Filter Tabs */}
            <section className="px-6 max-w-7xl mx-auto mb-12">
                <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === null
                                ? "bg-white text-black font-medium"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${selectedCategory === cat
                                    ? "bg-white text-black font-medium"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {cat.replace("-", " ")}
                        </button>
                    ))}
                </div>
            </section>

            {/* Posts Grid */}
            <section className="px-6 max-w-7xl mx-auto pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-white/40">
                            No posts found in this category.
                        </div>
                    ) : (
                        filteredPosts.map((post) => (
                            <Link
                                key={post._id}
                                href={`/thoughts/${post.slug}`}
                                className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:bg-white/10"
                            >
                                {/* Image Placeholder or Actual Image */}
                                <div className="aspect-[16/9] bg-white/5 relative overflow-hidden">
                                    {post.coverImage ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${post.coverImage}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/10 text-4xl font-serif">
                                            {post.title.charAt(0)}
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur text-xs font-medium text-white rounded-full uppercase tracking-wider border border-white/10">
                                        {post.category || "thought"}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-xs text-white/40 mb-4 font-mono">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "Draft"}
                                        </div>
                                        <span>•</span>
                                        <div>5 min read</div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-white/60 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                                        {post.excerpt || "No summary available."}
                                    </p>

                                    <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                        Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}
