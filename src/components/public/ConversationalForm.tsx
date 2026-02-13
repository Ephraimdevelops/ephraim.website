"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { leadSchema, type LeadInput } from "@/lib/validations";

// Form steps
const steps = [
    {
        id: "name",
        question: "What's your name?",
        type: "text",
        placeholder: "John Doe",
        field: "name" as const,
    },
    {
        id: "email",
        question: "What's your email?",
        type: "email",
        placeholder: "john@company.com",
        field: "email" as const,
    },
    {
        id: "company",
        question: "What company are you with?",
        type: "text",
        placeholder: "Acme Inc. (optional)",
        field: "company" as const,
        optional: true,
    },
    {
        id: "projectType",
        question: "What are you building?",
        type: "select",
        field: "projectType" as const,
        options: [
            { value: "website", label: "Website", icon: "🌐" },
            { value: "webapp", label: "Web App", icon: "⚡" },
            { value: "mobile", label: "Mobile App", icon: "📱" },
            { value: "branding", label: "Brand Identity", icon: "✦" },
            { value: "consulting", label: "Consulting", icon: "💡" },
            { value: "other", label: "Something else", icon: "🚀" },
        ],
    },
    {
        id: "budget",
        question: "What's your budget?",
        type: "select",
        field: "budget" as const,
        options: [
            { value: "under2k", label: "Under $2K", icon: "💰" },
            { value: "2k-5k", label: "$2K - $5K", icon: "💰💰" },
            { value: "5k-10k", label: "$5K - $10K", icon: "💰💰💰" },
            { value: "10k-25k", label: "$10K - $25K", icon: "💎" },
            { value: "25k+", label: "$25K+", icon: "🏆" },
            { value: "unsure", label: "Not sure yet", icon: "🤔" },
        ],
    },
    {
        id: "message",
        question: "Tell me about your project",
        type: "textarea",
        placeholder: "What problem are you solving? What's your timeline?",
        field: "message" as const,
        optional: true,
    },
];

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 100 : -100,
        opacity: 0,
    }),
};

/**
 * ConversationalForm - Typeform-style Contact
 * 
 * Features:
 * - One question per screen with massive typography
 * - Auto-advance on selection
 * - Smooth AnimatePresence transitions
 * - Hidden UTM field capture
 * - Zod validation
 */
export function ConversationalForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [formData, setFormData] = useState<Partial<LeadInput>>({});
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Capture UTM params on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            setFormData((prev) => ({
                ...prev,
                utmSource: params.get("utm_source") || undefined,
                utmMedium: params.get("utm_medium") || undefined,
                utmCampaign: params.get("utm_campaign") || undefined,
                referrer: document.referrer || undefined,
            }));
        }
    }, []);

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setDirection(1);
            setCurrentStep((prev) => prev + 1);
            setErrors([]);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
            setErrors([]);
        }
    };

    const handleTextInput = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            [step.field]: value,
        }));
    };

    const handleSelectOption = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            [step.field]: value,
        }));
        // Auto-advance on selection
        setTimeout(handleNext, 300);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors([]);

        // Validate with Zod
        const result = leadSchema.safeParse(formData);

        if (!result.success) {
            setErrors(result.error.issues.map((e) => e.message));
            setIsSubmitting(false);
            return;
        }

        try {
            // TODO: Submit to Convex
            console.log("Submitting lead:", result.data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setIsComplete(true);
        } catch {
            setErrors(["Something went wrong. Please try again."]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && step.type !== "textarea") {
            e.preventDefault();
            if (isLastStep) {
                handleSubmit();
            } else {
                handleNext();
            }
        }
    };

    // Success state
    if (isComplete) {
        return (
            <div className="flex items-center justify-center bg-[#02040A] rounded-2xl border border-white/10 p-12 h-full min-h-[400px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="text-center"
                >
                    <motion.div
                        className="text-6xl mb-8 text-[#00D4FF]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        ✓
                    </motion.div>
                    <h2 className="font-editorial text-3xl md:text-4xl mb-4 text-white">
                        Message <span className="italic">received</span>
                    </h2>
                    <p className="text-[#8A9AB4] text-lg max-w-md mx-auto">
                        I&apos;ll be in touch within 24 hours.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-[#02040A] border border-white/10 rounded-2xl p-6 md:p-12 h-full flex flex-col justify-center min-h-[500px]">
            <div className="w-full">
                {/* Progress */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-technical text-[#8A9AB4]">
                            {String(currentStep + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                        </span>
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="font-technical text-[#8A9AB4] disabled:opacity-30 hover:text-[#E8ECF4] transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                    <div className="h-[1px] bg-[#3259A8]/20">
                        <motion.div
                            className="h-full bg-[#3259A8]"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        />
                    </div>
                </div>

                {/* Question */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step.id}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <h2 className="font-editorial text-3xl md:text-5xl mb-8 text-[#E8ECF4]">
                            {step.question}
                        </h2>

                        {/* Text Input */}
                        {(step.type === "text" || step.type === "email") && (
                            <input
                                type={step.type}
                                value={(formData[step.field] as string) || ""}
                                onChange={(e) => handleTextInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={step.placeholder}
                                autoFocus
                                className="w-full bg-transparent border-b-2 border-[#3259A8]/30 focus:border-[#3259A8] text-xl md:text-2xl py-4 text-[#E8ECF4] placeholder:text-[#4A5568] outline-none transition-colors"
                            />
                        )}

                        {/* Textarea */}
                        {step.type === "textarea" && (
                            <textarea
                                value={(formData[step.field] as string) || ""}
                                onChange={(e) => handleTextInput(e.target.value)}
                                placeholder={step.placeholder}
                                autoFocus
                                rows={4}
                                className="w-full bg-transparent border-b-2 border-[#3259A8]/30 focus:border-[#3259A8] text-lg md:text-xl py-4 text-[#E8ECF4] placeholder:text-[#4A5568] outline-none transition-colors resize-none"
                            />
                        )}

                        {/* Select Options */}
                        {step.type === "select" && step.options && (
                            <div className="grid grid-cols-2 gap-3 md:gap-4 mt-8">
                                {step.options.map((option) => (
                                    <motion.button
                                        key={option.value}
                                        onClick={() => handleSelectOption(option.value)}
                                        className={`p-4 md:p-6 rounded-xl border text-left transition-all ${formData[step.field] === option.value
                                            ? "border-[#3259A8] bg-[#3259A8]/10"
                                            : "border-[#3259A8]/20 hover:border-[#3259A8]/50"
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-xl md:text-2xl mb-2 block">{option.icon}</span>
                                        <span className="text-[#E8ECF4] font-medium text-sm md:text-base">{option.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Errors */}
                        {errors.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 text-red-400 text-sm"
                            >
                                {errors.map((error, i) => (
                                    <p key={i}>{error}</p>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="mt-8 md:mt-12 flex justify-between items-center">
                    <p className="font-technical text-[#4A5568] text-[10px] md:text-xs">
                        {step.optional ? "Optional – press Enter to skip" : "Press Enter ↵"}
                    </p>

                    {step.type !== "select" && (
                        <motion.button
                            onClick={isLastStep ? handleSubmit : handleNext}
                            disabled={isSubmitting}
                            className="bg-[#3259A8] text-white px-6 py-3 rounded-full font-technical font-medium hover:bg-[#3259A8]/90 transition-all text-sm md:text-base"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        ◌
                                    </motion.span>
                                    Sending...
                                </span>
                            ) : isLastStep ? (
                                "Send Message"
                            ) : (
                                "Continue →"
                            )}
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
