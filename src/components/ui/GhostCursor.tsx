"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * GhostCursor - The "Difference" Cursor
 * 
 * Features:
 * - mix-blend-mode: difference (inverts colors behind it)
 * - Physics-based trailing with spring animation
 * - Magnetic snapping to interactive elements
 * - Scales up on hover, vanishes on buttons
 */
export function GhostCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClickable, setIsClickable] = useState(false);
    const [cursorText, setCursorText] = useState("");

    // Raw mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smoothed position with spring physics (creates trailing effect)
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    // Cursor size with spring
    const cursorSize = useSpring(16, { damping: 20, stiffness: 300 });

    useEffect(() => {
        // Only show custom cursor on non-touch devices
        const isTouchDevice =
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0 ||
            (window.matchMedia("(hover: none)").matches);

        if (isTouchDevice) return;

        setIsVisible(true);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check for interactive elements
            const isInteractive =
                target.tagName === "BUTTON" ||
                target.tagName === "A" ||
                target.closest("button") ||
                target.closest("a") ||
                target.closest("[data-cursor-hover]");

            // Check for text elements to apply difference mode
            const isText =
                target.tagName === "P" ||
                target.tagName === "H1" ||
                target.tagName === "H2" ||
                target.tagName === "H3" ||
                target.tagName === "H4" ||
                target.tagName === "H5" ||
                target.tagName === "H6" ||
                target.tagName === "SPAN";

            // Check for specific cursor actions
            const cursorAction = target.getAttribute("data-cursor") ||
                target.closest("[data-cursor]")?.getAttribute("data-cursor");

            if (isInteractive || isText) {
                setIsHovering(true);
            }

            if (isInteractive) {
                cursorSize.set(60);

                // Check if it's a button (should hide cursor)
                const isButton = target.tagName === "BUTTON" || target.closest("button");
                setIsClickable(!!isButton);
            }

            if (cursorAction) {
                setCursorText(cursorAction);
            }
        };

        const handleMouseLeave = () => {
            setIsHovering(false);
            setIsClickable(false);
            setCursorText("");
            cursorSize.set(16);
        };

        // Add event listeners
        window.addEventListener("mousemove", handleMouseMove);

        // Use event delegation for hover effects
        document.addEventListener("mouseover", handleMouseEnter);
        document.addEventListener("mouseout", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseover", handleMouseEnter);
            document.removeEventListener("mouseout", handleMouseLeave);
        };
    }, [mouseX, mouseY, cursorSize]);

    // Hide on touch devices
    if (!isVisible) return null;

    return (
        <>
            {/* Hide default cursor */}
            <style jsx global>{`
        @media (hover: hover) and (pointer: fine) {
          * {
            cursor: none !important;
          }
          a, button, [role="button"] {
            cursor: none !important;
          }
        }
      `}</style>

            {/* The Ghost Cursor */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[9999]"
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
            >
                {/* Main cursor circle - Hybrid Mode */}
                <AnimatePresence>
                    {!isClickable && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{
                                width: cursorSize,
                                height: cursorSize,
                                backgroundColor: "white",
                                // Only apply difference mode when hovering over text/interactive to prevent muddiness on Navy bg
                                mixBlendMode: isHovering ? "difference" : "normal",
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Cursor text (for special actions like "View") */}
                <AnimatePresence>
                    {cursorText && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                            style={{
                                width: 80,
                                height: 80,
                            }}
                        >
                            <span
                                className="text-xs font-medium uppercase tracking-widest"
                                style={{ mixBlendMode: "difference", color: "white" }}
                            >
                                {cursorText}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Outer ring (appears on hover) */}
                <AnimatePresence>
                    {isHovering && !isClickable && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
                            style={{
                                width: 80,
                                height: 80,
                                borderColor: "white",
                                mixBlendMode: "difference",
                            }}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}

/**
 * MagneticButton - Button with magnetic cursor attraction
 * 
 * Use this wrapper around buttons for the magnetic effect
 */
interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
}

export function MagneticButton({ children, className = "", onClick, href }: MagneticButtonProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Move button towards cursor (magnetic effect)
        x.set(distanceX * 0.3);
        y.set(distanceY * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const Component = href ? motion.a : motion.button;

    return (
        <Component
            href={href}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: xSpring, y: ySpring }}
            className={`relative inline-block ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </Component>
    );
}
