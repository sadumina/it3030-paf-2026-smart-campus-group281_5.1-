import { motion } from "framer-motion";
import { Megaphone, Lightbulb, Video, Layers } from "lucide-react";

const services = [
  {
    icon: Megaphone,
    title: "Social pulse",
    description: "Realtime content calendars, approvals, and personalized rollouts.",
    accent: "from-[#ffe6cc] to-[#fff7ed]",
  },
  {
    icon: Lightbulb,
    title: "Marketing science",
    description: "Experiment dashboards that surface insights and ready-to-use actions.",
    accent: "from-[#ffe4ec] to-white",
  },
  {
    icon: Video,
    title: "Viral engine",
    description: "Short-form storytelling kits paired with performance snapshots.",
    accent: "from-[#e7f8ff] to-white",
  },
  {
    icon: Layers,
    title: "Other delights",
    description: "UX polish, onboarding scripts, and partner enablement in one place.",
    accent: "from-[#fef3f2] to-white",
  },
];

export default function StatsSection() {
  return (
    <section id="services" className="relative overflow-hidden bg-gradient-to-b from-white via-[#fff6ec] to-white py-24">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-gradient-to-tr from-white via-orange-100 to-transparent blur-[90px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-[#ffd9c2] to-transparent blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">Services</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">We provide the best services</h2>
          <p className="mt-3 text-slate-500">
            Crafted service pods keep strategy, creative, and data flowing together. No handoffs, just delightful dashboards.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                whileHover={{ y: -6 }}
                className={`rounded-3xl border border-orange-100/60 bg-gradient-to-b ${service.accent} p-6 shadow-[0_15px_40px_rgba(244,114,22,0.08)]`}
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{service.description}</p>
                <div className="mt-6 text-sm font-semibold text-orange-500">Explore more →</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
