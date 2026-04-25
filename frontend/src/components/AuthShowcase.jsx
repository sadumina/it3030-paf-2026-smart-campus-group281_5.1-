import { motion } from "framer-motion";
import { Bell, CalendarCheck2, CircleCheckBig, Sparkles, TicketCheck } from "lucide-react";

export default function AuthShowcase({ variant = "login" }) {
  const isRegister = variant === "register";
  const panelTone = isRegister
    ? "bg-[#fff1e7]"
    : "bg-[#f4fbf2]";
  const glowTone = isRegister
    ? "bg-[radial-gradient(circle_at_22%_18%,rgba(249,115,22,0.2),transparent_32%),radial-gradient(circle_at_84%_78%,rgba(15,23,42,0.12),transparent_34%)]"
    : "bg-[radial-gradient(circle_at_18%_18%,rgba(255,176,109,0.18),transparent_32%),radial-gradient(circle_at_86%_80%,rgba(249,115,22,0.16),transparent_34%)]";
  const accentColor = isRegister ? "text-slate-950" : "text-orange-500";
  const badgeColor = isRegister ? "text-slate-900" : "text-orange-600";
  const badgeText = isRegister ? "Student Onboarding" : "Smart Campus";

  return (
    <motion.section
      className={`relative hidden overflow-hidden p-8 lg:block ${panelTone}`}
      initial={{ opacity: 0, x: isRegister ? -32 : 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.48, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`absolute inset-0 ${glowTone}`} />

      <div className="relative flex h-full min-h-[620px] flex-col justify-between">
        <div className="flex justify-end">
          <span className={`inline-flex items-center gap-2 border border-orange-200 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${badgeColor}`}>
            <Sparkles className="h-3.5 w-3.5" />
            {badgeText}
          </span>
        </div>

        <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center">
          <motion.div
            className="absolute left-2 top-8 grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-white shadow-sm"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <CalendarCheck2 className={`h-7 w-7 ${accentColor}`} />
          </motion.div>
          <motion.div
            className="absolute bottom-16 right-2 grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-white shadow-sm"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bell className={`h-7 w-7 ${accentColor}`} />
          </motion.div>

          <div className="absolute left-2 bottom-10 w-36 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-extrabold text-slate-900">{isRegister ? "New Account" : "Campus Ticket"}</p>
            <p className="text-xs text-slate-500">{isRegister ? "Student" : "12 Tasks"}</p>
            <div className="mt-3 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                84%
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                Active
              </span>
            </div>
          </div>

          <motion.div
            className="relative h-56 w-56 rounded-full bg-white shadow-[inset_0_0_0_2px_rgba(251,146,60,0.22)]"
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute left-1/2 top-10 h-20 w-20 -translate-x-1/2 rounded-full bg-slate-950" />
            <div className="absolute left-1/2 top-14 h-16 w-16 -translate-x-1/2 rounded-full bg-[#fff3e8]" />
            <div className="absolute left-1/2 top-20 h-6 w-10 -translate-x-1/2 rounded-b-full border-b-2 border-slate-900" />
            <div className={`absolute left-1/2 top-28 h-24 w-32 -translate-x-1/2 rounded-t-[3rem] ${isRegister ? "bg-slate-950" : "bg-orange-500"}`} />
            <CircleCheckBig className="absolute left-1/2 top-36 h-12 w-12 -translate-x-1/2 text-white" />
            <div className="absolute left-8 top-32 h-20 w-7 -rotate-12 rounded-full bg-[#fff3e8]" />
            <div className="absolute right-8 top-32 h-20 w-7 rotate-12 rounded-full bg-[#fff3e8]" />
            <div className="absolute bottom-2 left-10 h-24 w-16 -rotate-45 rounded-full border-[14px] border-[#fff3e8]" />
            <div className="absolute bottom-2 right-10 h-24 w-16 rotate-45 rounded-full border-[14px] border-[#fff3e8]" />
          </motion.div>

          <div className="absolute right-16 top-4 rounded-[2rem] border-2 border-orange-300/70 px-10 py-8" />
          <TicketCheck className={`absolute right-20 top-14 h-8 w-8 ${isRegister ? "text-slate-700" : "text-orange-400"}`} />
        </div>

        <div className="mx-auto max-w-md text-center">
          <div className="mb-5 flex justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className={`h-2 w-6 rounded-full ${isRegister ? "bg-slate-950" : "bg-orange-500"}`} />
          </div>
          <h2 className="font-['Outfit'] text-2xl font-extrabold text-slate-900">
            {isRegister ? "Start organized from day one" : "Make campus work easier and organized"}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            {isRegister
              ? "Create one account for bookings, support requests, updates, and role-aware dashboards."
              : "Continue managing resources, tickets, alerts, and campus operations from one clean workspace."}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
