"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/admin/editor/TiptapEditor";
import {
    ArrowLeft,
    Save,
    Globe,
    Image as ImageIcon,
    MoreHorizontal,
    Trash2,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function EditorPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();

    const post = useQuery(api.posts.getBySlug, { slug });
    const updatePost = useMutation(api.posts.update);
    const deletePost = useMutation(api.posts.remove);
    const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("thought");
    const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | undefined>(undefined);

    // UI States
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Load data when post is fetched
    useEffect(() => {
        if (post) {
            setTitle(post.title || "");
            setExcerpt(post.excerpt || "");
            setContent(post.content || "");
            setCategory(post.category || "thought");
            setCoverImageId(post.coverImage);
        }
    }, [post]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Get Upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload File
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // 3. Update State
            setCoverImageId(storageId);
            setIsDirty(true);
        } catch (error) {
            console.error(error);
            alert("Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (newStatus?: "draft" | "published") => {
        if (!post) return;
        setIsSaving(true);

        try {
            await updatePost({
                id: post._id,
                title,
                excerpt,
                content,
                category,
                coverImage: coverImageId,
                status: newStatus || post.status as any,
            });
            setIsDirty(false);
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!post || !confirm("Are you sure you want to delete this post?")) return;
        await deletePost({ id: post._id });
        router.push("/admin/content");
    };

    if (post === undefined) {
        return <div className="text-white/40 animate-pulse">Loading editor...</div>;
    }

    if (post === null) {
        return <div className="text-white/40">Post not found.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">

            {/* Header / Toolbar */}
            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md py-4 border-b border-white/10 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/content"
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="text-xs font-mono text-white/40 uppercase tracking-wider">
                            {post.status}
                        </div>
                        <div className="text-sm font-medium text-white/80">
                            {isDirty ? "Unsaved changes" : "All changes saved"}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDelete}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button
                        onClick={() => handleSave()}
                        disabled={!isDirty || isSaving}
                        className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(post.status === "published" ? "draft" : "published")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${post.status === "published"
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
                            }`}
                    >
                        {isSaving
                            ? "Saving..."
                            : post.status === "published" ? "Unpublish" : "Publish"
                        }
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Editor */}
                <div className="lg:col-span-8 space-y-8">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setIsDirty(true);
                        }}
                        placeholder="Post Title"
                        className="w-full bg-transparent text-4xl font-serif font-bold text-white placeholder-white/20 focus:outline-none"
                    />

                    <div className="prose prose-invert prose-lg max-w-none">
                        <TiptapEditor
                            content={content}
                            onChange={(html) => {
                                // Avoid marking dirty on initial load if content matches
                                if (html !== content) {
                                    setContent(html);
                                    setIsDirty(true);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Sidebar settings */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#0A0C14]/50 border border-white/10 rounded-xl p-6 backdrop-blur-md space-y-6 sticky top-32">
                        <h3 className="text-sm font-medium text-white/40 uppercase tracking-widest">
                            Metadata
                        </h3>

                        <div className="space-y-2">
                            <label className="text-sm text-white/60">URL Slug</label>
                            <div className="flex items-center gap-2 text-sm text-white/40 font-mono break-all">
                                <span>/thoughts/</span>
                                <span className="text-white">{slug}</span>
                                <ExternalLink className="w-3 h-3" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-white/60">Excerpt / Meta Description</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => {
                                    setExcerpt(e.target.value);
                                    setIsDirty(true);
                                }}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-white/60">Category</label>
                            <select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    setIsDirty(true);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                            >
                                <option value="thought">Thought</option>
                                <option value="tutorial">Tutorial</option>
                                <option value="case-study">Case Study</option>
                            </select>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            {coverImageId ? (
                                <div className="relative group rounded-lg overflow-hidden border border-white/10">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${coverImageId}`}
                                        alt="Cover"
                                        className="w-full h-40 object-cover"
                                    />
                                    <button
                                        onClick={() => {
                                            if (confirm("Remove cover image?")) {
                                                setCoverImageId(undefined);
                                                setIsDirty(true);
                                            }
                                        }}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={isUploading}
                                    />
                                    <div className={`w-full flex items-center justify-center gap-2 py-8 border border-dashed border-white/10 rounded-lg text-white/40 group-hover:text-white group-hover:border-white/20 transition-all ${isUploading ? "animate-pulse" : ""}`}>
                                        <ImageIcon className="w-5 h-5" />
                                        <span>{isUploading ? "Uploading..." : "Set Cover Image"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
