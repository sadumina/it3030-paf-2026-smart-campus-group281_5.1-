import { useEffect, useRef } from "react";
import anime from "../vendor/anime.es.js";
import { BellRing, CalendarClock, CheckCircle2, Ticket } from "lucide-react";

const items = [
  {
    title: "Request Created",
    subtitle: "Student submits booking/support request",
    icon: CalendarClock,
    accent: "text-orange-500 bg-orange-100",
  },
  {
    title: "Team Assigned",
    subtitle: "Technician or admin is auto-notified",
    icon: BellRing,
    accent: "text-sky-500 bg-sky-100",
  },
  {
    title: "Issue Resolved",
    subtitle: "Ticket closed with tracked SLA status",
    icon: Ticket,
    accent: "text-violet-500 bg-violet-100",
  },
];

export default function LandingWorkflowVisual() {
  const cardRefs = useRef([]);
  const pulseRef = useRef(null);

  useEffect(() => {
    const animationA = anime({
      targets: cardRefs.current,
      translateY: [8, -8],
      delay: anime.stagger(180),
      duration: 1300,
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
    });

    const animationB = anime({
      targets: pulseRef.current,
      scale: [1, 1.1],
      opacity: [0.35, 0.75],
      duration: 1400,
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
    });

    return () => {
      animationA.pause();
      animationB.pause();
    };
  }, []);

  return (
    <div className="relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div
        ref={pulseRef}
        className="absolute right-6 top-5 h-14 w-14 rounded-full bg-orange-200/60 blur-lg"
      />

      <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        Workflow Preview
      </p>

      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="relative rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <span className={`rounded-lg p-2 ${item.accent}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
              </div>
              {index < items.length - 1 ? (
                <div className="absolute -bottom-2 left-8 h-3 w-px bg-gradient-to-b from-orange-300 to-transparent" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
