import { Metadata } from "next";
import { WorkGallery } from "@/components/public/WorkGallery";
import { Navbar } from "@/components/public/Navbar";

export const metadata: Metadata = {
    title: "Work | Ephraim - Digital Architect",
    description: "A selection of premium digital products, websites, and brand experiences created for bold visionaries.",
    openGraph: {
        title: "Work | Ephraim",
        description: "Explore a portfolio of cinematic web experiences and digital products.",
    }
};

export default function WorkPage() {
    return (
        <main className="relative bg-[#02040A] min-h-screen">
            <Navbar />
            <WorkGallery />
        </main>
    );
}
