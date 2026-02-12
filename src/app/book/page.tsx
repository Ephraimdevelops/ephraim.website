import { BookingInterface } from "@/components/public/BookingInterface";

export const metadata = {
    title: "Book a Session",
    description: "Schedule a time with Ephraim. Timezone synced globally.",
};

export default function BookingPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-0">
            <div className="container-wide">
                <div className="text-center mb-16">
                    <p className="font-technical mb-4 text-[#3259A8] animate-pulse">SYSTEM ONLINE</p>
                    <h1 className="font-editorial text-hero text-white mb-6">
                        Sync <span className="italic text-[#8A9AB4]">Coordinates</span>
                    </h1>
                    <p className="text-[#8A9AB4] max-w-lg mx-auto">
                        Select a time slot below. The system automatically aligns with your local timeline.
                    </p>
                </div>

                <BookingInterface />
            </div>
        </div>
    );
}
