"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { format } from "date-fns";
import {
    Plus,
    FileText,
    MoreHorizontal,
    Eye,
    Edit3,
    Globe
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContentPage() {
    const posts = useQuery(api.posts.list, {});
    const createPost = useMutation(api.posts.create);
    const router = useRouter();

    const handleCreate = async () => {
        const title = window.prompt("Enter post title:");
        if (!title) return;

        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        try {
            await createPost({
                title,
                slug,
                content: ""
            });
            router.push(`/admin/content/${slug}`);
        } catch (error) {
            alert("Failed to create post. Slug might be taken.");
            console.error(error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case "draft": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "scheduled": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            default: return "text-white/40 bg-white/5 border-white/10";
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                        Content Manager
                    </h1>
                    <p className="text-white/40 mt-1 font-light">
                        Write and publish your thoughts.
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3259A8] hover:bg-[#264280] text-white rounded-lg text-sm transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-4 h-4" />
                    New Draft
                </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0A0C14]/50 backdrop-blur-md overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/60 font-medium">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Published</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {!posts ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-white/40 animate-pulse">
                                    Loading updates from the uplink...
                                </td>
                            </tr>
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                    No content found. Start writing.
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr
                                    key={post._id}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-6 py-4 font-medium text-white">
                                        {post.title}
                                    </td>
                                    <td className="px-6 py-4 text-white/40 font-mono text-xs">
                                        /{post.slug}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">
                                        {post.publishedAt
                                            ? format(new Date(post.publishedAt), "MMM d, yyyy")
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/content/${post.slug}`}
                                            className="p-1.5 hover:bg-white/10 text-white/40 hover:text-white rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Link>
                                        {post.status === "published" && (
                                            <a
                                                href={`/thoughts/${post.slug}`}
                                                target="_blank"
                                                className="p-1.5 hover:bg-white/10 text-white/40 hover:text-emerald-400 rounded transition-colors"
                                                title="View Live"
                                            >
                                                <Globe className="w-4 h-4" />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
