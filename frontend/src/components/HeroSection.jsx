import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Layers, ArrowRight, Info } from "lucide-react";

const metrics = [
  { label: "Live resources", value: "482" },
  { label: "Avg. resolution", value: "3.1h" },
  { label: "Audit-ready logs", value: "12.4K" },
];

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-36 pb-28">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-x-12 top-0 h-72 rounded-[40px] bg-gradient-to-r from-cyan-500/30 via-transparent to-fuchsia-500/30 blur-3xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -right-32 top-24 h-72 w-72 rounded-full border border-white/5"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200"
            >
              <Shield className="h-4 w-4" /> Neon control room
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="mt-8 text-4xl font-semibold leading-tight text-white sm:text-5xl"
            >
              Smart Campus Operations Hub with <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 bg-clip-text text-transparent">neon precision</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="mt-5 text-lg text-white/70"
            >
              Spin up a living dashboard for catalogues, bookings, incidents, and notifications. Prevent dead dashboards with live presence indicators, auto-escalations, and laser-sharp audit trails.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <button
                onClick={() => navigate("/login")}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(14,165,233,0.45)]"
              >
                Launch console
                <ArrowRight className="h-5 w-5" />
                <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
              <a
                href="#workflow"
                className="flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white/80 hover:text-white"
              >
                <Info className="h-5 w-5" /> View live workflow
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-10 grid gap-4 sm:grid-cols-3"
            >
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.35)]">
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{metric.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-8 shadow-[0_30px_100px_rgba(14,165,233,0.25)]"
          >
            <div className="absolute inset-x-6 -top-3 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
              <span>Live control plane</span>
              <Layers className="h-4 w-4" />
            </div>
            <div className="mt-6 space-y-4">
              {["Catalogue", "Bookings", "Incidents", "Notifications"].map((label, index) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>{label}</span>
                    <span className="text-cyan-300">{index === 1 ? "LIVE" : "SYNC"}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 ${
                        index === 0 ? "w-4/5" : index === 1 ? "w-full animate-pulse" : index === 2 ? "w-3/4" : "w-2/3"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">status feed</p>
              <div className="mt-3 space-y-2 text-sm text-white/80">
                <p>• Faculty boardroom booked · APPROVED in 32s</p>
                <p>• Lab projector ticket escalated · Technician A</p>
                <p>• OAuth callback verified · Audit log synced</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
