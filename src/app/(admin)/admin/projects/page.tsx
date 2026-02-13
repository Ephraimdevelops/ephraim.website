"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { ProjectDialog } from "@/components/admin/ProjectDialog";

export default function ProjectsPage() {
    const projects = useQuery(api.projects.list, {}) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Projects</h1>
                    <p className="text-white/60">Track active work.</p>
                </div>
                <ProjectDialog mode="create">
                    <Button className="bg-[#00D4FF] text-black hover:bg-[#00b3d6]">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                </ProjectDialog>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/60">Title</TableHead>
                            <TableHead className="text-white/60">Client</TableHead>
                            <TableHead className="text-white/60">Category</TableHead>
                            <TableHead className="text-white/60">Status</TableHead>
                            <TableHead className="text-white/60 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-white/40">
                                    No projects found. Launch something new.
                                </TableCell>
                            </TableRow>
                        ) : (
                            projects?.map((project: any) => (
                                <TableRow key={project._id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">
                                        {project.title}
                                        {project.isFeatured && (
                                            <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">
                                                FEATURED
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-white/80">
                                        <span className="font-mono text-xs opacity-50">{project.clientId?.toString().slice(0, 8) || "-"}</span>
                                    </TableCell>
                                    <TableCell className="text-white/80">
                                        {project.category || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/20 text-white/80 capitalize">
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ProjectDialog mode="edit" project={project}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </ProjectDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
