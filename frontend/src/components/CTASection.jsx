import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, PhoneCall } from "lucide-react";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#031227]" />
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 60, -30, 0], y: [0, -30, 10, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-12 h-72 w-72 rounded-full bg-cyan-500/20 blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, -50, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-8 right-4 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[200px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl lg:grid-cols-[2fr,1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 text-white/90">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">neon control</span>
            </div>
            <h2 className="mt-6 text-4xl font-semibold text-white">Switch on the always-live CleverCampus dashboard</h2>
            <p className="mt-3 text-white/70">
              Deploy the CleverCampus Operations Hub in hours, not weeks. Connect OAuth, import your resources, and watch every booking, ticket, and notification glow in real time.
            </p>

            <div className="mt-8 grid gap-4 text-white/70 sm:grid-cols-2">
              {["Module A–D boilerplates", "Realtime notification fabric", "Audit-grade event replay", "24/7 ops coach access"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_25px_80px_rgba(14,165,233,0.45)]"
              >
                Get instant access
                <ArrowRight className="h-5 w-5" />
                <span className="pointer-events-none absolute inset-0 bg-white/15 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
              <button className="flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white/80 hover:text-white">
                Book a neon tour
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[28px] border border-white/15 bg-black/30 p-6 text-white"
          >
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Ops hotline</p>
            <h3 className="mt-3 text-2xl font-semibold">Talk to a live engineer</h3>
            <p className="mt-3 text-white/80">+94 71 555 2314</p>
            <p className="text-white/60">ops@clevercampus.io</p>
            <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-3 text-sm font-semibold text-white">
              <PhoneCall className="h-4 w-4" />
              Request a callback
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

