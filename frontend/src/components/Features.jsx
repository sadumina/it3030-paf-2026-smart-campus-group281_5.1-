import { motion } from "framer-motion";
import { CalendarDays, ShieldCheck, BellRing, Users } from "lucide-react";

const services = [
  {
    title: "Booking System",
    description: "Reserve halls, labs, and studios with conflict-free schedules and instant confirmations.",
    icon: CalendarDays,
    accent: "bg-orange-50 text-orange-500",
  },
  {
    title: "Incident Management",
    description: "Log, prioritize, and resolve incidents with technician routing and progress insight.",
    icon: ShieldCheck,
    accent: "bg-emerald-50 text-emerald-500",
  },
  {
    title: "Smart Notifications",
    description: "Trigger nudges for approvals, escalations, and completed checklists in real time.",
    icon: BellRing,
    accent: "bg-sky-50 text-sky-500",
  },
  {
    title: "Role-Based Access",
    description: "Give admins, students, and technicians tailored dashboards with SSO baked in.",
    icon: Users,
    accent: "bg-indigo-50 text-indigo-500",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

export default function Features() {
  return (
    <section id="features" className="bg-white px-4 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Capabilities</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">We Provide the Best Services</h2>
          <p className="mt-3 text-lg text-slate-600">
            Card-based modules crafted with care. Smooth hover states, soft shadows, and delightful spacing keep everything premium.
          </p>
        </div>

        <motion.div
          id="services"
          className="grid gap-6 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {services.map(({ title, description, icon: Icon, accent }, index) => (
            <motion.article
              key={title}
              custom={index}
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: "0 25px 60px rgba(15,23,42,0.08)" }}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition will-change-transform"
            >
              <div className={`mb-6 inline-flex items-center justify-center rounded-2xl p-3 ${accent}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-slate-600">{description}</p>
            </motion.article>
          ))}
        </motion.div>

        <div
          id="about"
          className="grid gap-10 rounded-[32px] border border-slate-100 bg-gradient-to-r from-white to-orange-50 px-8 py-12 shadow-[0_40px_90px_rgba(15,23,42,0.05)] lg:grid-cols-2"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">About</p>
            <h3 className="text-3xl font-semibold text-slate-900">Built for campus-wide alignment</h3>
            <p className="text-lg text-slate-600">
              CampusHub keeps your booking catalogues, technicians, and leadership teams operating with clarity. Every pixel is tuned for modern SaaS expectations.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-4 text-sm font-semibold text-slate-700 shadow-sm">
                <p className="text-3xl font-semibold text-orange-500">98%</p>
                <p className="text-slate-500">Faster approvals</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 text-sm font-semibold text-slate-700 shadow-sm">
                <p className="text-3xl font-semibold text-slate-900">24/7</p>
                <p className="text-slate-500">Ops visibility</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Workspace health</p>
                  <p className="text-4xl font-semibold text-slate-900">A+</p>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">Live</span>
              </div>
              <div className="mt-6 space-y-4">
                {["Usage", "Incidents", "Bookings"].map((metric, idx) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>{metric}</span>
                      <span className="text-orange-500">{idx === 0 ? "92%" : idx === 1 ? "18 open" : "312"}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                        style={{ width: `${idx === 0 ? 92 : idx === 1 ? 64 : 80}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.span
              className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-200/60"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
