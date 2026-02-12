"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface ProfitDialProps {
    current: number;
    target: number;
    label: string;
}

export function ProfitDial({ current, target, label }: ProfitDialProps) {
    const percentage = Math.min(100, Math.max(0, (current / target) * 100));
    const [animatedValue, setAnimatedValue] = useState(0);

    // SVG Configuration
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    useEffect(() => {
        // Simple count-up animation for the number
        let start = 0;
        const end = current;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutExpo)
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setAnimatedValue(start + (end - start) * ease);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [current]);

    const isPositive = current >= 0;

    return (
        <div className="relative flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
                {label}
            </h3>

            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Circle */}
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="rotate-[-90deg] transition-all duration-500"
                >
                    <circle
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        stroke={isPositive ? "#10B981" : "#EF4444"}
                        strokeWidth={stroke}
                        strokeDasharray={circumference + " " + circumference}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        className="text-3xl font-bold text-white flex items-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="text-lg text-white/40 mr-1">$</span>
                        {Math.round(animatedValue).toLocaleString()}
                    </motion.div>
                    <div className="text-xs text-white/40 mt-1 font-mono">
                        / ${target.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm">
                {percentage >= 100 ? (
                    <span className="flex items-center text-emerald-400 gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <TrendingUp size={14} />
                        Target Hit
                    </span>
                ) : (
                    <span className="text-white/40 flex items-center gap-1">
                        {percentage.toFixed(0)}% to Goal
                    </span>
                )}
            </div>
        </div>
    );
}
