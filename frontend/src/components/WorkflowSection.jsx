import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const flows = [
  {
    title: "Booking lifecycle",
    scope: "Bookings",
    steps: ["Request", "Pending", "Approved", "Rejected", "Cancelled"],
    accent: "from-cyan-400 via-blue-500 to-fuchsia-500",
    description:
      "Pending requests glow cyan until a reviewer approves or rejects. Admin overrides pulse magenta, so everyone sees who cancelled what.",
  },
  {
    title: "Ticket lifecycle",
    scope: "Incidents",
    steps: ["Open", "In Progress", "Resolved", "Closed"],
    accent: "from-emerald-400 via-cyan-400 to-blue-500",
    description:
      "Technicians drag tickets through each neon lane. Closing requires admin sign-off, logged with a timestamped signature.",
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#050b1d] to-[#040a18]" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-white/70">Workflow lattice</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">Neon rails show exactly where work flows</h2>
          <p className="mt-3 text-white/60">Each module inherits the same rule engine, so statuses never fall out of sync.</p>
        </motion.div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          {flows.map((flow, index) => (
            <motion.div
              key={flow.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(5,10,25,0.8)]"
            >
              <div className="absolute inset-x-6 -top-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">{flow.scope}</p>
                  <h3 className="mt-1 text-2xl font-semibold text-white">{flow.title}</h3>
                </div>
                <ArrowRight className="h-5 w-5 text-white/60" />
              </div>

              <div className="mt-8 space-y-4">
                <div className="relative flex items-center gap-3 overflow-x-auto rounded-full border border-white/10 bg-black/30 p-3">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${flow.accent} opacity-30 blur-3xl`} />
                  {flow.steps.map((step, stepIndex) => (
                    <div key={step} className="relative flex items-center gap-2 text-sm font-semibold text-white">
                      <span
                        className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.3em] ${
                          stepIndex === 0 ? "border-cyan-300 text-cyan-200" : "border-white/15 text-white/60"
                        }`}
                      >
                        {step}
                      </span>
                      {stepIndex < flow.steps.length - 1 && <span className="text-white/30">→</span>}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-white/70">{flow.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
