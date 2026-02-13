
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FileText, Settings } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    // Secure Admin Access
    // In a real app, use Roles/Permissions. For a portfolio, a hard check is safest.
    const user = await currentUser();
    const adminEmail = process.env.ADMIN_EMAIL;

    // If ADMIN_EMAIL is set, enforce it.
    if (adminEmail && user?.emailAddresses[0]?.emailAddress !== adminEmail) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505] text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                    <p className="text-white/60">
                        You are signed in as {user?.emailAddresses[0]?.emailAddress}, but you are not the admin.
                    </p>
                    <a href="/" className="text-blue-400 hover:underline">Return Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#050505] text-[#EDEDED]">
            <AdminSidebar />
            <main className="flex-1 ml-0 md:ml-64 overflow-y-auto p-4 pt-20 md:p-8 relative">
                {/* Noise overlay for consistency */}
                <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-[60]"
                    style={{ backgroundImage: 'url("/noise.png")' }} />

                {children}
            </main>
        </div>
    );
}
