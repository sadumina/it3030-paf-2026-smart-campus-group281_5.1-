import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Sparkles } from "lucide-react";

const highlightMetrics = [
  {
    label: "Campaigns delivered",
    value: "320+",
    detail: "cross-channel launches",
  },
  {
    label: "Avg. conversion",
    value: "4.3x",
    detail: "vs. last quarter",
  },
  {
    label: "Client rating",
    value: "4.9/5",
    detail: "experience score",
  },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fff7ed] via-white to-white pt-32 pb-20">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, 20, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-gradient-to-tr from-orange-200 via-amber-100 to-white blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 30, 0], y: [0, 10, -30, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-rose-200 via-orange-100 to-transparent blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center rounded-full border border-orange-200/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">
              Rise & shine brands
            </div>

            <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-[56px]">
              We craft warm, human dashboards
              <span className="block text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text">
                for bold campus teams
              </span>
            </h1>

            <p className="text-lg text-slate-600">
              BrandHive blends storytelling, analytics, and automation to keep every stakeholder aligned. Launch thoughtful experiences, measure what matters, and stay inspired.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 px-8 py-4 text-base font-semibold text-white shadow-[0_15px_40px_rgba(249,115,22,.35)] transition-all hover:translate-y-[-2px]"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="group flex items-center justify-center gap-2 rounded-full border border-orange-200/70 bg-white/70 px-8 py-4 text-base font-semibold text-orange-500 transition-all hover:bg-orange-50">
                <Play className="h-5 w-5" />
                Explore Walkthrough
              </button>
            </div>

            <div className="grid gap-6 rounded-3xl border border-orange-100 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,.08)] backdrop-blur">
              <div className="flex items-center gap-3 text-sm font-semibold text-orange-400">
                <Sparkles className="h-4 w-4" />
                Trusted by creative teams in 18 countries
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {highlightMetrics.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                    <p className="text-sm font-semibold text-slate-600">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-[32px] border border-orange-100 bg-white/90 p-8 shadow-[0_25px_80px_rgba(249,115,22,.15)]">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-orange-300">live dashboard</p>
                  <h3 className="text-2xl font-semibold text-slate-900">Engagement Pulse</h3>
                </div>
                <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-500">
                  +18% today
                </div>
              </div>

              <div className="space-y-6">
                {["Strategy", "Campaign", "Care"].map((label, index) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                      <span>{label} flow</span>
                      <span>{index === 0 ? "92%" : index === 1 ? "78%" : "65%"}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-orange-50">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: index === 0 ? "92%" : index === 1 ? "78%" : "65%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl bg-gradient-to-br from-orange-100 via-white to-rose-50 p-5">
                <p className="text-sm font-semibold text-orange-400">Next milestone</p>
                <p className="text-xl font-semibold text-slate-900">Quarterly showcase on Apr 18</p>
                <p className="text-sm text-slate-500">Content, design, and analytics packs already synced.</p>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-20 rounded-2xl border border-white/40 bg-gradient-to-br from-white to-orange-50 px-6 py-4 shadow-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">response time</p>
              <p className="text-3xl font-semibold text-slate-900">27m</p>
              <p className="text-sm text-slate-500">avg. client reply</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 -bottom-6 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/90 px-6 py-4 shadow-lg"
            >
              <Star className="h-6 w-6 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Top agency pick</p>
                <p className="text-xs text-slate-500">Forbes Design Radar 2026</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
