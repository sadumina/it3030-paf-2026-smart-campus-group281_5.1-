import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, PhoneCall } from "lucide-react";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500" />

      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 80, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -60, 20, 0], y: [0, 40, -10, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-[40px] border border-white/30 bg-white/5 p-10 backdrop-blur-lg lg:grid-cols-[2fr,1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 text-white/90">
              <div className="rounded-2xl bg-white/15 p-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.4em]">Ready?</span>
            </div>
            <h2 className="mt-6 text-4xl font-semibold text-white">Ready to get started?</h2>
            <p className="mt-3 text-white/80">
              Schedule a strategy call or jump straight into the dashboard. We’ll help you set up campaigns, migrate data, and train your team.
            </p>

            <div className="mt-8 flex flex-col gap-3 text-white/80 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                Faster onboarding with curated templates.
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                Live people, not chatbots.
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-orange-500"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="flex items-center justify-center gap-2 rounded-full border border-white/60 px-8 py-4 text-sm font-semibold text-white/90">
                Book a call
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[28px] border border-white/30 bg-white/10 p-6 text-white"
          >
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Need help?</p>
            <h3 className="mt-2 text-2xl font-semibold">Talk to a strategist</h3>
            <p className="mt-2 text-white/80">+94 71 555 2314</p>
            <p className="text-white/70">hello@brandhive.co</p>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 py-3 text-sm font-semibold">
              <PhoneCall className="h-4 w-4" />
              Contact us
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
