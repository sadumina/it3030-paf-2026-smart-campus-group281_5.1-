import { motion } from "framer-motion";
import { MessageCircle, ClipboardCheck, CreditCard, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Contact us",
    copy: "Drop your brief or challenges and meet the squad in 24 hours.",
  },
  {
    icon: ClipboardCheck,
    title: "Consult",
    copy: "We sketch a journey map, show moodboards, and align on KPIs.",
  },
  {
    icon: CreditCard,
    title: "Place order",
    copy: "Streamlined proposals, transparent pricing, and milestone tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Payment",
    copy: "Secure checkout plus live support as we launch together.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="solutions" className="relative py-24">
      <div className="absolute inset-x-0 top-12 mx-auto h-[70%] max-w-5xl rounded-[50px] bg-[#fff0e0] blur-[120px]" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[40px] bg-gradient-to-br from-[#fff6ed] via-[#ffe3cc] to-[#ffd3bf] p-10 shadow-[0_40px_120px_rgba(249,115,22,.18)]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-500">Simple solutions</p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900">We understand no two businesses are alike.</h2>
              <p className="mt-4 text-slate-600">
                Tap into our human-centered process that blends research, craft, and automation. Every phase is visible inside BrandHive so you always know what is next.
              </p>

              <div className="mt-8 space-y-5">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-white/40 bg-white/60 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 font-semibold">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                          <Icon className="h-5 w-5 text-orange-400" />
                          {step.title}
                        </div>
                        <p className="text-sm text-slate-600">{step.copy}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-orange-500 shadow-lg shadow-orange-200/70">
                  Get started
                </button>
                <button className="rounded-full border border-white/60 px-8 py-3 text-sm font-semibold text-white/80">
                  Read more
                </button>
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="rounded-[32px] border border-white/60 bg-white/80 p-8 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-orange-300">workflow</p>
                    <h3 className="text-2xl font-semibold text-slate-900">Live project board</h3>
                  </div>
                  <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-500">In progress</span>
                </div>

                <div className="mt-8 space-y-5">
                  {["Discovery", "Design", "Delivery"].map((phase, index) => (
                    <div key={phase} className="rounded-2xl border border-orange-50 bg-orange-50/40 p-4">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                        <span>{phase}</span>
                        <span>{index === 0 ? "Done" : index === 1 ? "Now" : "Next"}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map((avatar) => (
                            <div
                              key={`${phase}-${avatar}`}
                              className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-tr from-orange-400 to-rose-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">team</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl bg-gradient-to-r from-orange-100 to-pink-100 p-5">
                  <p className="text-sm font-semibold text-orange-500">Client note</p>
                  <p className="text-slate-700">“The warm dashboard makes it effortless to track every milestone.”</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
