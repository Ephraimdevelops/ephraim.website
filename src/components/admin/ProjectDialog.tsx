"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";

interface ProjectDialogProps {
    children?: React.ReactNode;
    project?: any; // Type accurately if possible
    mode: "create" | "edit";
}

export function ProjectDialog({ children, project, mode }: ProjectDialogProps) {
    const create = useMutation(api.projects.create);
    const update = useMutation(api.projects.update);
    const generateUploadUrl = useMutation(api.projects.generateUploadUrl);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState(project?.title || "");
    const [slug, setSlug] = useState(project?.slug || "");
    const [tagline, setTagline] = useState(project?.tagline || "");
    const [description, setDescription] = useState(project?.description || "");
    const [category, setCategory] = useState(project?.category || "Websites");
    const [status, setStatus] = useState(project?.status || "discovery");
    const [isFeatured, setIsFeatured] = useState(project?.isFeatured || false);
    const [liveUrl, setLiveUrl] = useState(project?.liveUrl || "");
    const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | undefined>(project?.coverImage);

    // Image Upload Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
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
            setCoverImageId(storageId);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === "create") {
                await create({
                    title,
                    slug,
                    tagline,
                    description,
                    category,
                    status: status as any,
                    isFeatured,
                    liveUrl,
                    coverImage: coverImageId,
                    progress: 0,
                });
            } else {
                await update({
                    id: project._id,
                    title,
                    slug,
                    tagline,
                    description,
                    category,
                    status: status as any,
                    isFeatured,
                    liveUrl,
                    coverImage: coverImageId,
                });
            }
            setOpen(false);
            // Optional: Reset form if create
        } catch (error) {
            console.error("Failed to save project:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-[#00D4FF] text-black hover:bg-[#00b3d6]">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Create Project" : "Edit Project"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (mode === "create") {
                                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                                    }
                                }}
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                            className="bg-white/5 border-white/10"
                            placeholder="e.g. A digital banking revolution"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white/5 border-white/10 h-32"
                            placeholder="Describe the project..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="Websites">Websites</option>
                                <option value="Apps">Apps</option>
                                <option value="Branding">Branding</option>
                                <option value="Systems">Systems</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="discovery">Discovery</option>
                                <option value="design">Design</option>
                                <option value="development">Development</option>
                                <option value="review">Review</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Live URL</Label>
                        <Input
                            value={liveUrl}
                            onChange={(e) => setLiveUrl(e.target.value)}
                            className="bg-white/5 border-white/10"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <Input
                            type="file"
                            onChange={handleImageUpload}
                            className="bg-white/5 border-white/10 cursor-pointer"
                            accept="image/*"
                        />
                        {coverImageId && <p className="text-xs text-green-400">Image uploaded successfully</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="featured"
                            checked={isFeatured}
                            onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                            className="border-white/20 data-[state=checked]:bg-[#00D4FF] data-[state=checked]:text-black"
                        />
                        <Label htmlFor="featured">Feature on Landing Page</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#00D4FF] text-black hover:bg-[#00b3d6]"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Project
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
