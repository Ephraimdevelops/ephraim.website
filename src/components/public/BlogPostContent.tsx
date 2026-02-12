"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import {
    Calendar,
    ArrowLeft,
    Clock,
    Share2,
    Tag
} from "lucide-react";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import Image from "next/image";

const lowlight = createLowlight(all);

// Read-only editor for rendering content
function PostViewer({ content }: { content: string }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            LinkExtension.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: "text-blue-400 underline cursor-pointer",
                },
            }),
            ImageExtension.configure({
                HTMLAttributes: {
                    class: "rounded-lg border border-white/10 my-8 shadow-2xl",
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content,
        editable: false,
        editorProps: {
            attributes: {
                class: "prose prose-invert prose-lg max-w-none focus:outline-none",
            },
        },
    });

    if (!editor) return null;

    return <EditorContent editor={editor} />;
}

export function BlogPostContent({ slug }: { slug: string }) {
    const post = useQuery(api.posts.getBySlug, { slug });

    if (post === undefined) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-pulse text-white/40">Loading post...</div>
            </div>
        );
    }

    if (post === null) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
                <h1 className="text-4xl font-serif text-white">404</h1>
                <p className="text-white/40">Thought not found.</p>
                <Link href="/thoughts" className="text-blue-400 hover:underline">
                    Back to thoughts
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-[#EDEDED] selection:bg-[#3259A8] selection:text-white pb-32">

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/thoughts"
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        All Thoughts
                    </Link>

                    <button className="text-white/60 hover:text-white transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            {/* Article Header */}
            <header className="max-w-4xl mx-auto px-6 pt-20 pb-12">
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/40 mb-8 font-mono">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                        <Tag className="w-3 h-3" />
                        {post.category || "Thought"}
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {post.publishedAt ? format(new Date(post.publishedAt), "MMMM d, yyyy") : "Draft"}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        5 min read
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-8">
                    {post.title}
                </h1>

                {post.excerpt && (
                    <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-3xl">
                        {post.excerpt}
                    </p>
                )}
            </header>

            {/* Cover Image */}
            {post.coverImage && (
                <div className="max-w-6xl mx-auto px-6 mb-20">
                    <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${post.coverImage}`}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1200px) 100vw, 1200px"
                            priority
                        />
                    </div>
                </div>
            )}

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-6">
                <PostViewer content={post.content} />
            </article>

            {/* Author Footer */}
            <footer className="max-w-3xl mx-auto px-6 mt-20 pt-12 border-t border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-serif text-xl font-bold">
                        E
                    </div>
                    <div>
                        <div className="text-white font-medium">Written by Ephraim</div>
                        <div className="text-sm text-white/40">Digital Architect & Software Engineer</div>
                    </div>
                </div>
            </footer>

        </div>
    );
}
