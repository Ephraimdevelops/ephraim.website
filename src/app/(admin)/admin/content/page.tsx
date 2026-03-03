"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import {
    FileText,
    Image as ImageIcon,
    Video,
    MessageSquare,
    Mic,
    Presentation,
    Mail,
    Building2,
    Sparkles,
    ChevronRight,
    Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CONTENT_TYPES = [
    { id: "blog_post", label: "Blog Post", desc: "Long-form editorial articles", icon: FileText, color: "#3259A8" },
    { id: "social_post", label: "Social Post", desc: "Captions & threads for social media", icon: MessageSquare, color: "#10b981" },
    { id: "image", label: "Image Asset", desc: "AI generated or uploaded graphics", icon: ImageIcon, color: "#8b5cf6" },
    { id: "video", label: "Video Asset", desc: "Short-form or long-form video", icon: Video, color: "#ef4444" },
    { id: "pitch_deck", label: "Pitch Deck", desc: "Presentation slides & narratives", icon: Presentation, color: "#C9A84C" },
    { id: "company_brief", label: "Company Brief", desc: "Brand guidelines & internal docs", icon: Building2, color: "#64748b" },
    { id: "email_campaign", label: "Email Campaign", desc: "Newsletters & announcements", icon: Mail, color: "#f59e0b" },
] as const;

const BRAND_VOICES = [
    { id: "corporate_authority", label: "Corporate Authority", desc: "Formal, precise, commanding" },
    { id: "luxury_lifestyle", label: "Quiet Luxury", desc: "Elegant, understated, exclusive" },
    { id: "bold_startup", label: "Bold Disruptor", desc: "Energetic, visionary, direct" },
    { id: "empathetic_guide", label: "Empathetic Guide", desc: "Warm, supportive, educational" },
    { id: "technical_expert", label: "Technical Expert", desc: "Analytical, detailed, objective" },
] as const;

export default function AssetEnginePage() {
    const router = useRouter();
    const createPost = useMutation(api.posts.create);
    const settings = useQuery(api.settings.get);

    const [selectedVoice, setSelectedVoice] = useState<string>("corporate_authority");
    const [searchQuery, setSearchQuery] = useState("");

    const handleCreateContent = async (typeId: string) => {
        // For now, route everything to the editor, but tag it in the future
        if (typeId === "blog_post" || typeId === "company_brief" || typeId === "email_campaign") {
            const title = window.prompt(`Enter title for your new ${typeId.replace("_", " ")}:`);
            if (!title) return;

            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

            try {
                await createPost({ title, slug, content: "" }); // Will add voice/type later
                router.push(`/admin/content/${slug}`);
            } catch {
                toast.error("Failed to create. Title might be taken.");
            }
        } else {
            toast.info(`${typeId.replace("_", " ")} generator coming in next phase`);
        }
    };

    const filteredTypes = CONTENT_TYPES.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()));

    const primaryAccent = settings?.primaryColor || "#1A1F36";
    const accent = settings?.accentColor || "#C9A84C";

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Asset Engine</h1>
                    <p className="text-white/40 mt-1 font-light flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        The content creation hub for your agency
                    </p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search formats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* AI Brand Voice Selector */}
            <div className="p-8 rounded-2xl border border-white/[0.06] relative overflow-hidden group">
                {/* Paper Texture bg */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <Mic className="w-4 h-4 text-white/40" />
                        <h2 className="text-xs font-medium text-white/50 uppercase tracking-[0.15em]">AI Brand Voice</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {BRAND_VOICES.map((voice) => {
                            const isSelected = selectedVoice === voice.id;
                            return (
                                <button
                                    key={voice.id}
                                    onClick={() => setSelectedVoice(voice.id)}
                                    className={`relative px-5 py-3 rounded-xl border text-left transition-all overflow-hidden ${isSelected ? "border-transparent text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]" : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white"}`}
                                >
                                    {isSelected && <div className="absolute inset-0 opacity-90" style={{ backgroundColor: accent }} />}
                                    <div className="relative z-10">
                                        <div className="text-sm font-medium">{voice.label}</div>
                                        <div className={`text-[10px] mt-0.5 ${isSelected ? "text-black/60" : "text-white/30"}`}>{voice.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content Type Grid */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryAccent }} />
                    <h2 className="text-xs font-medium text-white/50 uppercase tracking-[0.15em]">Content Formats</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => handleCreateContent(type.id)}
                            className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-300 text-left overflow-hidden flex flex-col min-h-[160px]"
                        >
                            {/* Paper texture hover effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }} />

                            {/* Color Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 translate-x-10 -translate-y-10" style={{ backgroundColor: type.color }} />

                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-center mb-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                <type.icon className="w-5 h-5" style={{ color: type.color }} />
                            </div>

                            <div className="mt-6 flex flex-col">
                                <span className="text-white font-medium text-sm group-hover:text-white transition-colors">
                                    {type.label}
                                </span>
                                <span className="text-white/40 text-xs mt-1">
                                    {type.desc}
                                </span>
                            </div>

                            {/* Hover Arrow */}
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                <ChevronRight className="w-4 h-4 text-white/50" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Output (Placeholder for next phase) */}
            <div className="pt-8 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-white/30" />
                        <h2 className="text-xs font-medium text-white/50 uppercase tracking-[0.15em]">Recent Output</h2>
                    </div>
                </div>
                <div className="p-12 rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium text-white/60">No recent assets</h3>
                    <p className="text-xs text-white/30 mt-1">Select a format above to start generating content.</p>
                </div>
            </div>
        </div>
    );
}
