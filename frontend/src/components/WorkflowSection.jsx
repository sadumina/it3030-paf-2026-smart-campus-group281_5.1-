import { motion } from "framer-motion";
import { PieChart, Target, TrendingUp, Quote, Star } from "lucide-react";

const agencyHighlights = [
  {
    title: "Audit-ready logs",
    copy: "Every booking, approval, and incident status change is time stamped and role-attributed.",
    icon: PieChart,
  },
  {
    title: "Role-based control",
    copy: "USER, ADMIN, and TECHNICIAN roles gate who can approve, assign, or close tickets.",
    icon: Target,
  },
  {
    title: "Actionable analytics",
    copy: "Utilization and SLA widgets highlight bottlenecks across facilities and maintenance.",
    icon: TrendingUp,
  },
];

const testimonials = [
  {
    name: "Dr. Nuwani K.",
    role: "Dean of Engineering",
    quote: "I finally approve lab requests with full context and zero email chains.",
  },
  {
    name: "Ruwan Senanayake",
    role: "Facilities Director",
    quote: "Technicians update tickets on tablets and students see progress instantly.",
  },
  {
    name: "Ishara Fernando",
    role: "IT Services Lead",
    quote: "OAuth login + notifications tick every requirement in our security plan.",
  },
];

export default function WorkflowSection() {
  return (
    <section id="agency" className="relative overflow-hidden bg-white py-24">
      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 20, -20, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 h-64 w-64 rounded-full bg-gradient-to-br from-orange-100 to-transparent blur-[90px]"
        />
        <motion.div
          animate={{ x: [0, -30, 30, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gradient-to-tr from-[#ffe5d0] to-transparent blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">Governance</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-900">Auditability without friction.</h2>
            <p className="mt-4 text-slate-600">
              CampusFlow captures every touch—from OAuth login to technician updates—so accreditation reviews, SOC checks, and semester planning all reference the same immutable trail.
            </p>

            <div className="mt-10 space-y-5">
              {agencyHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-3xl border border-orange-100 bg-white/80 p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="mt-8 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(249,115,22,.35)]">
              View compliance pack
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-[32px] border border-orange-100 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,.08)]">
              <p className="text-xs uppercase tracking-[0.4em] text-orange-300">insight mural</p>
              <h3 className="mt-2 text-3xl font-semibold text-slate-900">Campus intelligence</h3>
              <p className="text-sm text-slate-500">Bookings, incidents, and notifications layered into one friendly dashboard.</p>

              <div className="mt-8 grid gap-5">
                {["Utilization", "Approval speed", "SLA success"].map((metric, index) => (
                  <div key={metric} className="rounded-2xl bg-orange-50/60 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>{metric}</span>
                      <span>{index === 0 ? "82" : index === 1 ? "94" : "76"}%</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-white">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: index === 0 ? "82%" : index === 1 ? "94%" : "76%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="h-3 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-center gap-4 rounded-2xl border border-orange-50 bg-white p-4 shadow-sm">
                <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-500">
                  <Quote className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Weekly insight drop</p>
                  <p className="text-xs text-slate-500">Handwritten notes from strategists + action items.</p>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-6 bottom-10 rounded-2xl border border-orange-100 bg-white p-4 shadow-lg"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-orange-300">net promoter</p>
              <p className="text-3xl font-semibold text-slate-900">76</p>
              <p className="text-sm text-slate-500">industry leading</p>
            </motion.div>
          </motion.div>
        </div>

        <div id="testimonials" className="mt-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">What campuses say</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-900">Operational calm, proven.</h2>
            <p className="mt-3 text-slate-500">Administrators, technicians, and IT leads share how CampusFlow fits their daily workflow.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                whileHover={{ y: -6 }}
                className="rounded-[28px] border border-orange-100 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,.07)]"
              >
                <div className="flex items-center gap-2 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${testimonial.name}-${index}`} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-slate-600">“{testimonial.quote}”</p>
                <div className="mt-6">
                  <p className="text-base font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
