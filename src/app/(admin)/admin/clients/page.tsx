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

export default function ClientsPage() {
    const clients = useQuery(api.clients.getClients) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Clients</h1>
                    <p className="text-white/60">Manage your rolodex.</p>
                </div>
                <Button className="bg-[#00D4FF] text-black hover:bg-[#00b3d6]">
                    <Plus className="w-4 h-4 mr-2" />
                    New Client
                </Button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/60">Name</TableHead>
                            <TableHead className="text-white/60">Company</TableHead>
                            <TableHead className="text-white/60">Status</TableHead>
                            <TableHead className="text-white/60">Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-white/40">
                                    No clients found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients?.map((client) => (
                                <TableRow key={client._id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{client.name}</TableCell>
                                    <TableCell className="text-white/80">{client.company || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/20 text-white/80 capitalize">
                                            {client.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-white/60">{client.email}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
