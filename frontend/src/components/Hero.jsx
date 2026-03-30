import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const highlights = [
  "Bookings synced across every hub",
  "Incident desk with role-aware updates",
  "Insights that keep admins informed",
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-white px-4 py-20 sm:px-8 lg:px-12"
    >
      <motion.span
        className="pointer-events-none absolute -left-16 top-16 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.span
        className="pointer-events-none absolute right-10 top-10 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1 text-sm font-semibold text-orange-600 shadow-sm">
            Smart campus platform
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            We create <span className="text-orange-500">smart campus solutions</span>
          </h1>
          <p className="text-lg text-slate-600">
            Modern booking and incident management that keeps facilities, admins, and technicians aligned inside a single clean workspace.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.a
              href="#services"
              whileHover={{ y: -3 }}
              className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/40"
            >
              Get Started
            </motion.a>
            <motion.a
              href="#about"
              whileHover={{ y: -3 }}
              className="rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-900 shadow-sm"
            >
              Learn More
            </motion.a>
          </div>

          <div className="space-y-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Live occupancy</p>
                <p className="text-3xl font-semibold text-slate-900">78%</p>
              </div>
              <div className="rounded-2xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-500">+12% today</div>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-3 text-center text-sm font-medium text-slate-500">
              {["Labs", "Studios", "Halls", "Offices"].map((label) => (
                <div key={label} className="rounded-2xl bg-slate-50/80 px-3 py-2">
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4">
              {["Auditorium A", "Design Hub", "Chem Lab 02"].map((space, idx) => (
                <div
                  key={space}
                  className="flex items-center justify-between rounded-2xl bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <span>{space}</span>
                  <span className="text-orange-500">{idx === 0 ? "In Use" : idx === 1 ? "Reserved" : "Ready"}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="absolute -right-6 top-8 rounded-2xl bg-white px-4 py-3 shadow-xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <p className="text-xs font-semibold text-slate-500">Technicians online</p>
            <p className="text-lg font-semibold text-slate-900">12</p>
          </motion.div>

          <motion.div
            className="absolute -left-8 bottom-10 rounded-full border border-orange-100 bg-white px-4 py-3 shadow-xl"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <p className="text-xs font-semibold text-slate-500">Alerts</p>
            <p className="text-lg font-semibold text-orange-500">3 pending</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
