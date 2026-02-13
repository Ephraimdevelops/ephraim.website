"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/public/Navbar";
import { PortfolioSection } from "@/components/public/PortfolioSection";
import { AboutSection } from "@/components/public/AboutSection";
import { CircuitServices } from "@/components/public/CircuitServices";
import { ServicesSection } from "@/components/public/ServicesSection";
import { InsightsSection } from "@/components/public/InsightsSection";
import { ConversationalForm } from "@/components/public/ConversationalForm";


// Premium animation config
const transition = {
  duration: 1.2,
  ease: [0.19, 1, 0.22, 1] as const,
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition },
};

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="relative">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION - "THE BUSINESS BUILDER"
          Layout: Split (Text Left, Portrait Right)
          Copy: Simplified for clarity ("Standard Seven Billionaire")
          Features: Mobile Optimized (40vh image)
          ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pt-32 md:pt-0"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#02040A]" />
          <motion.div
            className="absolute top-1/4 right-0 h-[60vh] w-[60vw] rounded-full bg-[#3259A8]/[0.05] blur-[150px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.08, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container-wide relative z-10 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: Text Content */}
          <motion.div
            className="order-2 md:order-1 text-center md:text-left"
            style={{ y: heroY, opacity: heroOpacity }}
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {/* Pre-headline */}
            <motion.div className="flex items-center justify-center md:justify-start gap-3 mb-8" variants={fadeUp}>
              <div className="px-3 py-1 rounded-full border border-[#3259A8]/30 bg-[#3259A8]/10 text-[#3259A8] text-[11px] font-technical uppercase tracking-wider">
                Result Oriented
              </div>
              <p className="font-technical text-[11px] text-[#8A9AB4] tracking-widest uppercase">
                Digital Business Builder
              </p>
            </motion.div>

            {/* Headline - Simplified & Powerful */}
            <motion.h1
              className="font-editorial text-5xl md:text-6xl lg:text-7xl text-[#E8ECF4] leading-[1.1] mb-8"
              variants={fadeUp}
            >
              Your guy for
              <br />
              <span className="italic text-[#3259A8]">Powerful Websites</span>
              <br />
              & Smart Systems.
            </motion.h1>

            {/* Subheadline - Simple everyday language */}
            <motion.p
              className="mt-6 max-w-lg mx-auto md:mx-0 text-lg text-[#8A9AB4] leading-relaxed"
              variants={fadeUp}
            >
              I build modern platforms, apps, websites, branding and set up AI agents to handle your busy work. Look better, work faster, and sell more.
            </motion.p>

            {/* CTA Buttons - Clear actions */}
            <motion.div
              className="mt-10 flex flex-wrap items-center justify-center md:justify-start gap-4"
              variants={fadeUp}
            >
              <Link href="/book" className="btn-primary">
                Start a Project
              </Link>
              <Link href="/work" className="btn-ghost">
                View My Work
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT: Portrait Image with BOTTOM SHADOW CLEAN BLEND */}
          <motion.div
            className="order-1 md:order-2 relative h-[40vh] md:h-[85vh] w-full flex items-end justify-center md:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* 
                 The Image Container
                 Includes a "Bottom Shadow" gradient to prevent the "cropped" look.
             */}
            <div className="relative w-full h-full max-w-md md:max-w-full">

              {/* Fallback Label (hidden if image loads) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="font-technical text-[#3259A8]/50 text-xs uppercase tracking-widest text-center px-4">
                  Save image as hero-portrait.png
                </p>
              </div>

              {/* The Portrait Image - Assumed PNG with transparency or full bleed */}
              <Image
                src="/images/hero-portrait.png"
                alt="Ephraim Ngowi"
                fill
                className="object-contain object-bottom"
                priority
              />

              {/* 
                    THE BOTTOM SHADOW / FADE
                    This gradient creates the seamless blend user requested.
                */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#02040A] via-[#02040A]/80 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="flex flex-col items-center gap-3"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="font-technical text-[10px] text-[#8A9AB4]">
              Scroll
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. STATS SECTION - Simplified Language */}
      <section className="relative z-10 border-t border-[#3259A8]/10 bg-[#02040A]">
        <div className="container-wide py-20">
          <motion.div
            className="grid grid-cols-2 gap-12 md:grid-cols-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            {[
              { value: "50+", label: "Projects Completed" },
              { value: "12", label: "Countries Served" },
              { value: "5+", label: "Years Experience" },
              { value: "100%", label: "Happy Clients" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center"
                variants={fadeUp}
              >
                <p className="font-editorial text-5xl md:text-6xl text-[#E8ECF4]">
                  {stat.value}
                </p>
                <p className="font-technical mt-4">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <div id="about">
        <AboutSection />
      </div>

      {/* 4. SERVICES SECTION */}
      <div id="services">
        <ServicesSection />
      </div>

      {/* 5. PORTFOLIO SECTION */}
      <div id="work">
        <PortfolioSection />
      </div>

      {/* 6. PROCESS SECTION */}
      <CircuitServices />

      {/* 7. INSIGHTS SECTION */}
      <div id="insights">
        <InsightsSection />
      </div>

      {/* 8. CONTACT SECTION */}
      <section className="relative z-10 bg-[#02040A] pt-40 pb-20 border-t border-[#3259A8]/10" id="contact">
        <div className="container-wide text-center mb-12">
          <h2 className="font-editorial text-5xl md:text-7xl text-white mb-6">
            Ready to <span className="italic text-[#3259A8]">Start?</span>
          </h2>
          <p className="text-[#8A9AB4] mb-8 font-technical text-lg">
            Tell me about your vision or book a call directly.
          </p>

          <Link
            href="/book"
            className="inline-flex items-center gap-3 px-8 py-4 border border-[#3259A8] rounded-full text-[#3259A8] font-technical hover:bg-[#3259A8] hover:text-white transition-all duration-300 group"
          >
            Skip the form, Book a Call
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <ConversationalForm />
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#3259A8]/10 bg-[#02040A] py-16">
        <div className="container-wide">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <p className="font-editorial text-2xl text-[#E8ECF4]">Ephraim</p>
              <p className="font-technical mt-2">
                Digital Architect
              </p>
            </div>
            <nav className="flex items-center gap-8">
              {["Work", "Services", "About", "Insights", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="font-technical text-[11px] text-[#8A9AB4] transition-colors duration-500 hover:text-[#E8ECF4]"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-16 pt-8 border-t border-[#3259A8]/5">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="font-technical text-[10px] text-[#4A5568]">
                © {new Date().getFullYear()} Ephraim. Crafted with precision in Tanzania.
              </p>
              <p className="font-technical text-[10px] text-[#4A5568]">
                All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
