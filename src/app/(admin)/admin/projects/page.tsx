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
import { Plus } from "lucide-react";

export default function ProjectsPage() {
    // Used generic `list` query instead of `getProjects`
    const projects = useQuery(api.projects.list) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Projects</h1>
                    <p className="text-white/60">Track active work.</p>
                </div>
                <Button className="bg-[#00D4FF] text-black hover:bg-[#00b3d6]">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/60">Title</TableHead>
                            <TableHead className="text-white/60">Client</TableHead>
                            <TableHead className="text-white/60">Status</TableHead>
                            <TableHead className="text-white/60">Progress</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-white/40">
                                    No projects found. Launch something new.
                                </TableCell>
                            </TableRow>
                        ) : (
                            projects?.map((project: any) => (
                                <TableRow key={project._id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{project.title}</TableCell>
                                    <TableCell className="text-white/80">
                                        {/* Client Name would need a join or separate lookup, displaying ID for now or placeholder */}
                                        Client ID: {project.clientId?.toString().slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/20 text-white/80 capitalize">
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-white/60">{project.progress}%</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
