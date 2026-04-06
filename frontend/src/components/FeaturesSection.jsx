import { motion } from "framer-motion";
import { CalendarCheck, AlertTriangle, Bell, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Smart Booking System",
    description: "Conflict detection, multi-resource reservations, and animated status pills that never fall asleep.",
    icon: CalendarCheck,
    accent: "from-cyan-400/30 to-blue-500/10",
  },
  {
    title: "Incident Management",
    description: "Ticket matrix with SLA streaks, evidence uploads, and technician heatmaps in one pane.",
    icon: AlertTriangle,
    accent: "from-fuchsia-500/30 to-purple-500/10",
  },
  {
    title: "Notification Fabric",
    description: "Realtime tray for approvals, escalations, and chatty comments routed by roles.",
    icon: Bell,
    accent: "from-amber-400/30 to-orange-500/10",
  },
  {
    title: "Role-Based Access",
    description: "USER, ADMIN, TECHNICIAN rings with neon audit signatures and OAuth guardrails.",
    icon: ShieldCheck,
    accent: "from-emerald-400/30 to-teal-500/10",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.13),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-white/70">Platform pillars</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Edge-to-cloud automations dressed in neon</h2>
          <p className="mt-3 text-white/60">Every feature tile glows when its automation fires—no more lifeless dashboards.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="mt-14 grid gap-8 md:grid-cols-2"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -6 }}
                className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-7 shadow-[0_30px_80px_rgba(9,10,20,0.65)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-70 blur-3xl transition-opacity`} />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/20 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm text-white/70">{feature.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                    live signal
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
