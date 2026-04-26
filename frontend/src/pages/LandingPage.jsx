import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  ChartColumnBig,
  CircleCheckBig,
  LayoutDashboard,
  ShieldCheck,
  Ticket,
  UsersRound,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LandingWorkflowVisual from "../components/LandingWorkflowVisual";

const serviceCards = [
  {
    title: "Smart Booking",
    description: "Reserve labs, halls, and equipment with instant availability checks.",
    icon: CalendarClock,
    accent: "bg-amber-100 text-amber-600",
  },
  {
    title: "Ticket Handling",
    description: "Track requests from submission to resolution with complete transparency.",
    icon: Ticket,
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Live Alerts",
    description: "Send role-based reminders and updates for critical campus actions.",
    icon: Bell,
    accent: "bg-sky-100 text-sky-600",
  },
  {
    title: "Admin Insights",
    description: "View trends, SLAs, and utilization with clear operational dashboards.",
    icon: ChartColumnBig,
    accent: "bg-orange-100 text-orange-600",
  },
];

const workflowItems = ["Choose a resource", "Submit request", "Admin review", "Live status update"];

const heroMetrics = [
  { label: "Bookings", value: "128", color: "text-orange-600", bar: "w-[82%]" },
  { label: "Incidents", value: "24", color: "text-blue-600", bar: "w-[54%]" },
  { label: "Resolved", value: "91%", color: "text-emerald-600", bar: "w-[91%]" },
];

function HeroDashboardVisual() {
  return (
    <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Live Workspace</p>
          <p className="mt-1 text-sm font-bold text-slate-950">CleverCampus Overview</p>
        </div>
        <span className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">Online</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {heroMetrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
            <p className={`mt-1 text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            <div className="mt-3 h-1.5 rounded-full bg-white">
              <div className={`h-full rounded-full bg-orange-500 ${metric.bar}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr]">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Request Flow</p>
            <LayoutDashboard className="h-4 w-4 text-orange-500" />
          </div>
          {["Lab booking approved", "Printer issue assigned", "Seminar room available"].map((item, index) => (
            <div key={item} className="flex items-center gap-3 border-t border-slate-100 py-2 first:border-t-0">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-50 text-xs font-bold text-orange-700">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-slate-700">{item}</span>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
          <ShieldCheck className="h-5 w-5 text-orange-600" />
          <p className="mt-3 text-sm font-bold text-orange-900">Role-aware access</p>
          <p className="mt-1 text-xs leading-relaxed text-orange-700">
            Students, technicians, admins, and super admins each get the right workspace.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const prevBodyOverflowY = document.body.style.overflowY;
    const prevBodyOverflowX = document.body.style.overflowX;
    const prevHtmlOverflowY = document.documentElement.style.overflowY;
    const prevHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.overflowX = "hidden";

    return () => {
      document.body.style.overflowY = prevBodyOverflowY;
      document.body.style.overflowX = prevBodyOverflowX;
      document.documentElement.style.overflowY = prevHtmlOverflowY;
      document.documentElement.style.overflowX = prevHtmlOverflowX;
    };
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900">
      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          <section id="home" className="scroll-mt-28 grid items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
            <div className="reveal-on-scroll">
              <h1 className="font-display text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
                A clean operations dashboard for modern campus teams
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Manage bookings, incidents, availability, users, and analytics from one consistent workspace
                built for students, technicians, admins, and super admins.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                >
                  Sign In
                </button>
              </div>
            </div>

            <div className="reveal-on-scroll" style={{ "--reveal-delay": "100ms" }}>
              <HeroDashboardVisual />
            </div>
          </section>

          <section
            id="features"
            className="reveal-on-scroll scroll-mt-28 py-10"
            style={{ "--reveal-delay": "100ms" }}
          >
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-extrabold text-slate-950 sm:text-4xl">
                Core CleverCampus Modules
              </h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Practical tools designed to improve campus productivity and service quality.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {serviceCards.map((service, index) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.title}
                    className="reveal-on-scroll rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                    style={{ "--reveal-delay": `${index * 90}ms` }}
                  >
                    <span className={`inline-flex rounded-lg p-2 ${service.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-950">{service.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{service.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            id="services"
            className="reveal-on-scroll scroll-mt-28 grid gap-8 rounded-lg border border-orange-200 bg-orange-50 px-6 py-10 shadow-sm lg:grid-cols-2 lg:px-10"
            style={{ "--reveal-delay": "120ms" }}
          >
            <LandingWorkflowVisual />

            <div className="self-center reveal-on-scroll" style={{ "--reveal-delay": "180ms" }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Simple Process</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-slate-950">Simple, trackable workflows</h2>
              <p className="mt-3 text-slate-600">
                A clear step-by-step flow for fast operations and smooth service delivery.
              </p>

              <div className="mt-5 space-y-2">
                {workflowItems.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-md border border-orange-100 bg-white px-3 py-2 transition hover:border-orange-200 hover:shadow-sm"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="rounded-md bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
                >
                  Get Started
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-md border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-orange-50"
                >
                  Learn More
                </button>
              </div>
            </div>
          </section>

          <section
            id="about"
            className="reveal-on-scroll scroll-mt-28 grid items-center gap-8 py-14 lg:grid-cols-2"
            style={{ "--reveal-delay": "120ms" }}
          >
            <div className="reveal-on-scroll" style={{ "--reveal-delay": "170ms" }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Our Agency</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-slate-950">Built for modern campus teams</h2>
              <p className="mt-4 text-slate-600">
                We combine friendly user experience with operational depth, so your institution can manage
                demand, resolve issues faster, and keep stakeholders informed in real time.
              </p>

              <div className="mt-5 space-y-2">
                {[
                  "Role-aware dashboards for students, technicians, and admins.",
                  "Ticket and booking flows with clean tracking and status history.",
                  "Reliable analytics to improve service performance every month.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CircleCheckBig className="mt-0.5 h-4 w-4 text-orange-500" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-on-scroll grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              {[
                { icon: UsersRound, label: "Active users", value: "18,500+" },
                { icon: Ticket, label: "Tickets resolved", value: "97.4%" },
                { icon: CalendarClock, label: "Booking success", value: "99.1%" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-lg bg-orange-100 p-2 text-orange-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{row.label}</span>
                    </div>
                    <span className="text-base font-extrabold text-slate-900">{row.value}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
