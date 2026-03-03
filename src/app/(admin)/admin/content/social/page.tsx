"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Plus,
    Calendar,
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    Trash2,
    Instagram,
    Linkedin,
    Twitter,
} from "lucide-react";

const PLATFORM_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
    instagram: { bg: "bg-pink-500/20", text: "text-pink-400", icon: Instagram },
    linkedin: { bg: "bg-blue-500/20", text: "text-blue-400", icon: Linkedin },
    twitter: { bg: "bg-sky-500/20", text: "text-sky-400", icon: Twitter },
    facebook: { bg: "bg-indigo-500/20", text: "text-indigo-400", icon: Send },
    tiktok: { bg: "bg-cyan-500/20", text: "text-cyan-400", icon: Send },
};

const STATUS_STYLES: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400",
    scheduled: "bg-yellow-500/20 text-yellow-400",
    publishing: "bg-blue-500/20 text-blue-400",
    published: "bg-emerald-500/20 text-emerald-400",
    failed: "bg-red-500/20 text-red-400",
};

export default function SocialPage() {
    const posts = useQuery(api.socialPosts.list, {});
    const stats = useQuery(api.socialPosts.getStats, {});
    const accounts = useQuery(api.socialPosts.listAccounts, {});
    const assets = useQuery(api.contentAssets.list, { type: "image", status: "completed" });

    const createPost = useMutation(api.socialPosts.create);
    const schedulePost = useMutation(api.socialPosts.schedule);
    const removePost = useMutation(api.socialPosts.remove);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = posts?.filter(
        (p) => statusFilter === "all" || p.status === statusFilter
    );

    if (!posts || !stats) {
        return <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">Loading scheduler...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Social Scheduler</h1>
                    <p className="text-white/40 mt-1 font-light">Create, schedule, and publish content across platforms.</p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
                    <Plus className="w-4 h-4" /> New Post
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Draft" value={stats.draft} icon={Clock} color="text-gray-400" />
                <StatCard label="Scheduled" value={stats.scheduled} icon={Calendar} color="text-yellow-400" />
                <StatCard label="Published" value={stats.published} icon={CheckCircle2} color="text-emerald-400" />
                <StatCard label="Failed" value={stats.failed} icon={XCircle} color="text-red-400" />
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-[10px] text-white/60 uppercase tracking-wider mb-2">Platforms</div>
                    <div className="flex items-center gap-1 flex-wrap">
                        {Object.entries(stats.platformBreakdown || {}).map(([platform, count]) => {
                            const style = PLATFORM_STYLES[platform];
                            return (
                                <span key={platform} className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${style?.bg || "bg-white/10"} ${style?.text || "text-white/60"}`}>
                                    {platform} ({count as number})
                                </span>
                            );
                        })}
                        {Object.keys(stats.platformBreakdown || {}).length === 0 && (
                            <span className="text-xs text-white/30">No posts yet</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
                {["all", "draft", "scheduled", "published", "failed"].map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white"}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered?.map((post: any) => (
                    <div key={post._id} className="rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors group">
                        {/* Media Preview */}
                        {post.resolvedMediaUrl ? (
                            <div className="aspect-video bg-white/5 overflow-hidden">
                                <img src={post.resolvedMediaUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="aspect-video bg-white/5 flex items-center justify-center">
                                <Send className="w-8 h-8 text-white/10" />
                            </div>
                        )}

                        <div className="p-4 space-y-3">
                            {/* Caption */}
                            <p className="text-sm text-white/80 line-clamp-2">{post.caption}</p>

                            {/* Platforms */}
                            <div className="flex items-center gap-1 flex-wrap">
                                {post.targetPlatforms.map((p: string) => {
                                    const style = PLATFORM_STYLES[p];
                                    return (
                                        <span key={p} className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${style?.bg || "bg-white/10"} ${style?.text || "text-white/60"}`}>
                                            {p}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Status + Schedule */}
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_STYLES[post.status] || ""}`}>
                                    {post.status}
                                </span>
                                {post.scheduledAt && (
                                    <span className="text-[10px] text-white/40 font-mono">
                                        {new Date(post.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {post.status === "draft" && (
                                    <button onClick={async () => {
                                        const dt = prompt("Schedule date (YYYY-MM-DD HH:MM):");
                                        if (!dt) return;
                                        try {
                                            await schedulePost({ id: post._id, scheduledAt: new Date(dt).getTime() });
                                            toast.success("Post scheduled!");
                                        } catch (e) { toast.error("Invalid date"); }
                                    }} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-medium hover:bg-yellow-500/30">
                                        Schedule
                                    </button>
                                )}
                                <button onClick={() => { if (confirm("Delete?")) removePost({ id: post._id }); }} className="p-1 text-white/30 hover:text-red-400 ml-auto">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered?.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40">
                        No posts. Click &quot;New Post&quot; to start creating.
                    </div>
                )}
            </div>

            {/* Connected Accounts */}
            <div className="rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Connected Accounts</h3>
                <div className="flex items-center gap-3 flex-wrap">
                    {accounts?.map((acc: any) => {
                        const style = PLATFORM_STYLES[acc.platform];
                        return (
                            <div key={acc._id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 ${acc.isActive ? style?.bg : "bg-white/5 opacity-50"}`}>
                                <div className={`w-2 h-2 rounded-full ${acc.isActive ? "bg-emerald-400" : "bg-gray-500"}`} />
                                <span className="text-sm text-white/80">{acc.accountName}</span>
                                <span className={`text-xs ${style?.text || "text-white/40"}`}>{acc.platform}</span>
                            </div>
                        );
                    })}
                    {(!accounts || accounts.length === 0) && (
                        <p className="text-sm text-white/30">No accounts connected. OAuth integration coming soon.</p>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            {isDialogOpen && (
                <PostDialog
                    assets={assets || []}
                    onClose={() => setIsDialogOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            await createPost(data);
                            toast.success("Post created!");
                            setIsDialogOpen(false);
                        } catch (e) {
                            toast.error("Failed to create post");
                        }
                    }}
                />
            )}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-[10px] text-white/60 uppercase tracking-wider"><Icon className={`w-3.5 h-3.5 ${color}`} />{label}</div>
            <div className={`mt-1.5 text-xl font-bold ${color}`}>{value}</div>
        </div>
    );
}

function PostDialog({ assets, onClose, onSubmit }: { assets: any[]; onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        caption: "", contentAssetId: "", mediaUrl: "",
        targetPlatforms: [] as string[],
        scheduledAt: "",
    });

    const togglePlatform = (p: string) => {
        setForm({
            ...form,
            targetPlatforms: form.targetPlatforms.includes(p)
                ? form.targetPlatforms.filter((x) => x !== p)
                : [...form.targetPlatforms, p],
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.caption) { toast.error("Caption is required"); return; }
        if (form.targetPlatforms.length === 0) { toast.error("Select at least one platform"); return; }
        setLoading(true);
        try {
            await onSubmit({
                caption: form.caption,
                contentAssetId: form.contentAssetId ? (form.contentAssetId as Id<"contentAssets">) : undefined,
                mediaUrl: form.mediaUrl || undefined,
                mediaType: form.contentAssetId ? "image" as const : undefined,
                targetPlatforms: form.targetPlatforms,
                scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).getTime() : undefined,
            });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-serif font-bold text-white mb-6">New Post</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Caption *</label>
                        <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={4} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 resize-none" placeholder="Write your post caption..." />
                    </div>
                    {/* AI Asset */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">AI-Generated Image</label>
                        <select value={form.contentAssetId} onChange={(e) => setForm({ ...form, contentAssetId: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none">
                            <option value="" className="bg-[#0a0a0a]">None</option>
                            {assets.map((a: any) => (<option key={a._id} value={a._id} className="bg-[#0a0a0a]">{a.title}</option>))}
                        </select>
                    </div>
                    {/* Platforms */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">Target Platforms *</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {["instagram", "linkedin", "twitter", "tiktok", "facebook"].map((p) => {
                                const isSelected = form.targetPlatforms.includes(p);
                                const style = PLATFORM_STYLES[p];
                                return (
                                    <button type="button" key={p} onClick={() => togglePlatform(p)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isSelected ? `${style?.bg} ${style?.text}` : "bg-white/5 text-white/40 hover:text-white"}`}>
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Schedule */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Schedule (optional)</label>
                        <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50">{loading ? "Creating..." : "Create Post"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
