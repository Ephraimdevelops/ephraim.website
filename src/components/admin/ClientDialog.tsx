"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const clientSchema = z.object({
    name: z.string().min(2, "Name is required"),
    company: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    status: z.enum(["lead", "negotiating", "active", "retainer", "archived"]).default("lead"),
    notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientToEdit?: any; // Ideally user defined type from convex
}

export function ClientDialog({ open, onOpenChange, clientToEdit }: ClientDialogProps) {
    const createClient = useMutation(api.clients.create);
    const updateClient = useMutation(api.clients.update);

    const [loading, setLoading] = useState(false);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: "",
            company: "",
            email: "",
            phone: "",
            status: "lead",
            notes: "",
        },
    });

    useEffect(() => {
        if (clientToEdit) {
            form.reset({
                name: clientToEdit.name,
                company: clientToEdit.company || "",
                email: clientToEdit.email,
                phone: clientToEdit.phone || "",
                status: clientToEdit.status,
                notes: clientToEdit.notes || "",
            });
        } else {
            form.reset({
                name: "",
                company: "",
                email: "",
                phone: "",
                status: "lead",
                notes: "",
            });
        }
    }, [clientToEdit, form, open]);

    const onSubmit = async (data: ClientFormValues) => {
        setLoading(true);
        try {
            if (clientToEdit) {
                await updateClient({
                    id: clientToEdit._id,
                    ...data,
                });
                toast.success("Client updated successfully");
            } else {
                await createClient(data);
                toast.success("Client created successfully");
            }
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error(error);
            toast.error(clientToEdit ? "Failed to update client" : "Failed to create client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-[#0A0C14] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>{clientToEdit ? "Edit Client" : "Add New Client"}</DialogTitle>
                    <DialogDescription className="text-white/40">
                        {clientToEdit ? "Update client details and status." : "Add a new client to your rolodex."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="John Doe" className="bg-white/5 border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company (Optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Acme Inc." className="bg-white/5 border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" placeholder="john@example.com" className="bg-white/5 border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone (Optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="+1 (555) 000-0000" className="bg-white/5 border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/5 border-white/10">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#0A0C14] border-white/10 text-white">
                                                <SelectItem value="lead">Lead</SelectItem>
                                                <SelectItem value="negotiating">Negotiating</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="retainer">Retainer</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Additional details..." className="bg-white/5 border-white/10 min-h-[100px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-[#3259A8] hover:bg-[#264280]">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {clientToEdit ? "Save Changes" : "Create Client"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
