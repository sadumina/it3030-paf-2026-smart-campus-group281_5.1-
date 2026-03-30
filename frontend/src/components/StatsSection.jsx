import { motion } from "framer-motion";
import { Megaphone, Lightbulb, Video, Layers } from "lucide-react";

const services = [
  {
    icon: Megaphone,
    title: "Module A · Catalogue",
    description: "Inventory of halls, labs, fleets, and IoT sensors with capacity, power draw, and maintenance tags.",
    accent: "from-cyan-400/20 to-transparent",
  },
  {
    icon: Lightbulb,
    title: "Module B · Booking",
    description: "Real-time booking stack with conflict kill-switches and neon status pills for each transition.",
    accent: "from-fuchsia-500/20 to-transparent",
  },
  {
    icon: Video,
    title: "Module C · Incident",
    description: "Escalation-ready ticketing with attachments, technician pairing, and SLA streaks right in the feed.",
    accent: "from-blue-500/20 to-transparent",
  },
  {
    icon: Layers,
    title: "Module D · Notifications",
    description: "Unified notification tray with role-based routing, digest rules, and audit-grade delivery receipts.",
    accent: "from-emerald-400/20 to-transparent",
  },
];

export default function StatsSection() {
  return (
    <section id="services" className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12),_transparent_55%)]"
        />
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/30 to-transparent blur-[160px]"
        />
        <motion.div
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity }}
          className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-gradient-to-bl from-fuchsia-500/25 to-transparent blur-[200px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300">Core modules</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Every neon tile runs a campus-critical loop</h2>
          <p className="mt-4 text-white/70">
            Modules A–D are wired to the same data plane, so dashboards never feel dead. Each card lights up when telemetry flows through it.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                whileHover={{ y: -6 }}
                className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(7,20,68,0.55)]`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.accent} opacity-60 blur-3xl`} />
                <div className="relative">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{service.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                    Pulse data
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
