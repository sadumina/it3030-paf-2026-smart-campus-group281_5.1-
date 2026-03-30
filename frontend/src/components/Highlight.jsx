import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const bulletPoints = [
  "Manage bookings easily",
  "Track incidents",
  "Real-time notifications",
  "Role-based access",
];

export default function Highlight() {
  return (
    <section className="bg-gradient-to-br from-white via-orange-50/40 to-white px-4 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_35px_80px_rgba(249,115,22,0.15)]">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2].map((idx) => (
                  <span
                    key={idx}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600"
                  >
                    {idx === 0 ? "AR" : idx === 1 ? "JG" : "MS"}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Ops team</p>
                <p className="text-lg font-semibold text-slate-900">Online</p>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {["Facilities", "IT Service", "Student Union"].map((team, idx) => (
                <div key={team} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{team}</span>
                    <span className="text-orange-500">{idx === 0 ? "Active" : idx === 1 ? "Responding" : "Monitoring"}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                      style={{ width: `${idx === 0 ? 88 : idx === 1 ? 72 : 60}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            className="absolute -right-6 -top-6 rounded-2xl bg-white px-5 py-4 shadow-xl"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <p className="text-xs font-semibold text-slate-500">Response time</p>
            <p className="text-lg font-semibold text-slate-900">4m avg</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
            Simple Solutions
          </div>
          <h3 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Automation that still feels personal</h3>
          <p className="text-lg text-slate-600">
            Split layouts inspired by premium SaaS marketing sites. Every detail focuses on clarity, calm gradients, and soft geometry.
          </p>
          <div className="space-y-3">
            {bulletPoints.map((point) => (
              <div key={point} className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <span>{point}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <motion.a
              href="#services"
              whileHover={{ y: -3 }}
              className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/40"
            >
              Get Started
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ y: -3 }}
              className="rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-900 shadow-sm"
            >
              Contact
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
