"use client";

import { useQuery, useMutation } from "convex/react";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { ClientDialog } from "@/components/admin/ClientDialog";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function ClientsPage() {
    const clients = useQuery(api.clients.list, {}) || [];
    const removeClient = useMutation(api.clients.remove);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    const handleCreate = () => {
        setSelectedClient(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (client: any) => {
        setSelectedClient(client);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: Id<"clients">) => {
        if (confirm("Are you sure you want to delete this client?")) {
            try {
                await removeClient({ id });
                toast.success("Client deleted successfully");
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete client");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Clients</h1>
                    <p className="text-white/60">Manage your rolodex.</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-[#3259A8] hover:bg-[#264280] text-white"
                >
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
                            <TableHead className="text-white/60 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-white/40">
                                    No clients found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients?.map((client: any) => (
                                <TableRow key={client._id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{client.name}</TableCell>
                                    <TableCell className="text-white/80">{client.company || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/20 text-white/80 capitalize">
                                            {client.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-white/60">{client.email}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(client)}
                                                className="hover:bg-white/10 text-white/60 hover:text-white"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(client._id)}
                                                className="hover:bg-red-500/10 text-white/60 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ClientDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                clientToEdit={selectedClient}
            />
        </div>
    );
}
