"use client";

import { useState } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Sparkles,
    Image as ImageIcon,
    Type,
    MessageSquare,
    Presentation,
    Mail,
    ArrowLeft,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

// Form schemas for each generator type
type ImgForm = { title: string; prompt: string; size: "1024x1024" | "1024x1792" | "1792x1024"; quality: "standard" | "hd"; projectId: string };
type TextForm = { title: string; prompt: string; systemPrompt: string; model: "gpt-4o" | "gpt-4o-mini"; projectId: string };

const STUDIO_TOOLS = [
    { id: "image", title: "Visual Assets", desc: "Create stunning AI imagery with DALL-E 3 (HD)", icon: ImageIcon, color: "from-purple-500 to-fuchsia-600", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { id: "blog_post", title: "Articles & Blogs", desc: "Long-form editorial and thought leadership copy", icon: Type, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { id: "social_post", title: "Social Media Maestro", desc: "Platform-optimized captions and hooks", icon: MessageSquare, color: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: "email_campaign", title: "Email Campaigns", desc: "High-converting newsletters and autoresponders", icon: Mail, color: "from-orange-500 to-rose-600", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { id: "pitch_deck", title: "Pitch Decks", desc: "Strategic slide outlines and investor narratives", icon: Presentation, color: "from-amber-500 to-yellow-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

export default function AIStudioHub() {
    const router = useRouter();

    const generateImage = useAction(api.ai.generateImage);
    const generateText = useAction(api.ai.generateText);
    const createAsset = useMutation(api.posts.create);

    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Forms
    const [imgForm, setImgForm] = useState<ImgForm>({
        title: "", prompt: "", size: "1024x1024", quality: "standard", projectId: ""
    });
    const [txtForm, setTxtForm] = useState<TextForm>({
        title: "", prompt: "", systemPrompt: "", model: "gpt-4o", projectId: ""
    });

    const handleGenerateImage = async () => {
        if (!imgForm.title || !imgForm.prompt) { toast.error("Title and prompt required"); return; }
        setLoading(true);
        try {
            await generateImage({
                title: imgForm.title, prompt: imgForm.prompt, size: imgForm.size, quality: imgForm.quality,
                projectId: imgForm.projectId ? (imgForm.projectId as Id<"projects">) : undefined,
            });
            toast.success("Masterpiece created");
            router.push("/admin/content"); // redirect to Asset Library
        } catch (e: any) {
            toast.error(e.message || "Failed to generate");
        } finally { setLoading(false); }
    };

    const handleGenerateText = async () => {
        if (!txtForm.title || !txtForm.prompt) { toast.error("Title and prompt required"); return; }
        setLoading(true);
        try {
            // Wait, we need the UI to open the rich editor after generation.
            // But since AI studio creates the text, we'll generate the text via AI, 
            // then create the contentAsset, and redirect to the Editor.
            const result = await generateText({
                title: txtForm.title, prompt: txtForm.prompt, systemPrompt: txtForm.systemPrompt, model: txtForm.model,
                projectId: txtForm.projectId ? (txtForm.projectId as Id<"projects">) : undefined,
            });

            // The Action already creates a contentAssets document if we update the action.
            // But currently the action just returns text. 
            // We'll create it here as a blog post temporarily to load into the Editor.
            // Actually, wait, generateText action inserts into DB and returns id if we update it.
            // For now, let's just use the manual post creator:

            // To be 100x, AI generates the first draft, we open the Editor to finalize it.
            const slug = txtForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
            await createAsset({
                title: txtForm.title,
                slug: slug,
                content: result.text
            });
            toast.success("Draft created! Redirecting to Editor...");
            router.push(`/admin/content/${slug}`);
        } catch (e: any) {
            toast.error(e.message || "Failed to generate text");
        } finally { setLoading(false); }
    };

    if (activeTool) {
        const tool = STUDIO_TOOLS.find(t => t.id === activeTool)!;
        const isVisual = tool.id === "image";

        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => setActiveTool(null)}
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group mb-8"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Studio Hub
                </button>

                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${tool.bg} ${tool.border} border flex items-center justify-center`}>
                        <tool.icon className={`w-8 h-8 text-transparent bg-clip-text bg-gradient-to-br ${tool.color}`} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">{tool.title}</h1>
                        <p className="text-white/50">{tool.desc}</p>
                    </div>
                </div>

                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
                    {/* Background glow */}
                    <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br ${tool.color} opacity-10 blur-[100px] pointer-events-none`} />

                    {isVisual ? (
                        <>
                            <Field label="Asset Title *" value={imgForm.title} onChange={(v) => setImgForm({ ...imgForm, title: v })} placeholder="e.g. Q3 Campaign Hero Graphic" />
                            <div>
                                <label className="text-xs font-medium text-[#8A9AB4] uppercase tracking-widest block mb-3">Creative Prompt *</label>
                                <textarea
                                    value={imgForm.prompt}
                                    onChange={(e) => setImgForm({ ...imgForm, prompt: e.target.value })}
                                    rows={6}
                                    placeholder="Describe the exact visual aesthetic, lighting, and composition..."
                                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#C6A87C] focus:bg-white/[0.05] transition-all resize-none font-light"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-medium text-[#8A9AB4] uppercase tracking-widest block mb-3">Aspect Ratio</label>
                                    <select value={imgForm.size} onChange={(e) => setImgForm({ ...imgForm, size: e.target.value as any })} className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C6A87C]">
                                        <option value="1792x1024" className="bg-[#0a0a0a]">16:9 (Landscape)</option>
                                        <option value="1024x1792" className="bg-[#0a0a0a]">9:16 (Portrait / Reels)</option>
                                        <option value="1024x1024" className="bg-[#0a0a0a]">1:1 (Square)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#8A9AB4] uppercase tracking-widest block mb-3">Model Engine</label>
                                    <select value={imgForm.quality} onChange={(e) => setImgForm({ ...imgForm, quality: e.target.value as any })} className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C6A87C]">
                                        <option value="hd" className="bg-[#0a0a0a]">DALL-E 3 HD (Ultra Premium)</option>
                                        <option value="standard" className="bg-[#0a0a0a]">DALL-E 3 Standard</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleGenerateImage} disabled={loading} className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white text-black rounded-xl text-base font-semibold hover:bg-white/90 transition-all disabled:opacity-50 mt-8">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {loading ? "Rendering Visuals..." : "Generate Masterpiece"}
                            </button>
                        </>
                    ) : (
                        <>
                            <Field label="Document Title *" value={txtForm.title} onChange={(v) => setTxtForm({ ...txtForm, title: v })} placeholder="e.g. Q4 State of Design Analysis" />
                            <div>
                                <label className="text-xs font-medium text-[#8A9AB4] uppercase tracking-widest block mb-3">Agent Persona / System Prompt</label>
                                <textarea
                                    value={txtForm.systemPrompt}
                                    onChange={(e) => setTxtForm({ ...txtForm, systemPrompt: e.target.value })}
                                    rows={2}
                                    placeholder="You are an elite creative director speaking to an audience of Fortune 500 decision makers..."
                                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#C6A87C] focus:bg-white/[0.05] transition-all resize-none font-light"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[#8A9AB4] uppercase tracking-widest block mb-3">Instructions / Topic *</label>
                                <textarea
                                    value={txtForm.prompt}
                                    onChange={(e) => setTxtForm({ ...txtForm, prompt: e.target.value })}
                                    rows={6}
                                    placeholder="Write a comprehensive thesis on why minimalist web design is evolving into dimensional brutalism..."
                                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#C6A87C] focus:bg-white/[0.05] transition-all resize-none font-light"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[#8A9AB4] uppercase tracking-widest block mb-3">Model Engine</label>
                                <select value={txtForm.model} onChange={(e) => setTxtForm({ ...txtForm, model: e.target.value as any })} className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C6A87C]">
                                    <option value="gpt-4o" className="bg-[#0a0a0a]">GPT-4o (Premium Quality)</option>
                                    <option value="gpt-4o-mini" className="bg-[#0a0a0a]">GPT-4o Mini (High Speed)</option>
                                </select>
                            </div>
                            <button onClick={handleGenerateText} disabled={loading} className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white text-black rounded-xl text-base font-semibold hover:bg-white/90 transition-all disabled:opacity-50 mt-8">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {loading ? "Drafting Document..." : "Generate First Draft"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-[#C6A87C]" />
                    AI Studio
                </h1>
                <p className="text-white/50 mt-3 text-lg font-light max-w-2xl">
                    The cognitive engine behind your digital presence. Generate elite imagery and copy instantly.
                    Tokens and API calls are tracked automatically in your financial ledger.
                </p>
            </div>

            {/* Hub Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STUDIO_TOOLS.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className="group relative text-left p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all overflow-hidden flex flex-col h-[280px]"
                    >
                        {/* Glow effect */}
                        <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700 pointer-events-none`} />

                        <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.border} border flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                            <tool.icon className={`w-7 h-7 text-transparent bg-clip-text bg-gradient-to-br ${tool.color}`} />
                        </div>

                        <div className="mt-auto relative z-10">
                            <h3 className="text-xl font-medium text-white mb-2">{tool.title}</h3>
                            <p className="text-sm text-white/50 font-light leading-relaxed">{tool.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label className="text-xs font-medium text-[#8A9AB4] uppercase tracking-widest block mb-3">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#C6A87C] focus:bg-white/[0.05] transition-all font-light"
                placeholder={placeholder}
            />
        </div>
    );
}

