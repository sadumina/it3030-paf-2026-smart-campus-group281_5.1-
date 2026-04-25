import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CalendarClock, ChartColumnBig, CircleCheckBig, Sparkles, Ticket, UsersRound } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LandingHeroAnimeVisual from "../components/LandingHeroAnimeVisual";
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

const workflowItems = ["Contact us", "Consultation", "Place request", "Payment"];

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#fffaf5] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-20 h-44 w-44 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute bottom-16 right-6 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          <section id="home" className="scroll-mt-28 grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-16">
            <div className="reveal-on-scroll">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                <Sparkles className="h-3.5 w-3.5" />
                Professional Campus Platform
              </span>

              <h1 className="mt-5 font-['Outfit'] text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
                We create smart solutions
                <span className="text-orange-500"> for campus business</span>
              </h1>

              <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
                Manage resources, support requests, and campus operations from one modern dashboard built
                for students, technicians, and administrators.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="cta-pulse subtle-hover rounded-md bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Get Started
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="subtle-hover rounded-md border border-orange-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-slate-900"
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="reveal-on-scroll" style={{ "--reveal-delay": "120ms" }}>
              <LandingHeroAnimeVisual />
            </div>
          </section>

          <section
            id="features"
            className="reveal-on-scroll scroll-mt-28 py-10"
            style={{ "--reveal-delay": "100ms" }}
          >
            <div className="mb-8 text-center">
              <h2 className="font-['Outfit'] text-3xl font-extrabold text-slate-900 sm:text-4xl">
                We Provide The Best Services
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
                    className="reveal-on-scroll subtle-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md"
                    style={{ "--reveal-delay": `${index * 90}ms` }}
                  >
                    <span className={`inline-flex rounded-lg p-2 ${service.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="mt-4 font-['Outfit'] text-lg font-bold text-slate-900">{service.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{service.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            id="services"
            className="reveal-on-scroll scroll-mt-28 grid gap-8 rounded-3xl bg-[#fff1e7] px-6 py-10 lg:grid-cols-2 lg:px-10"
            style={{ "--reveal-delay": "120ms" }}
          >
            <LandingWorkflowVisual />

            <div className="self-center reveal-on-scroll" style={{ "--reveal-delay": "180ms" }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Simple Process</p>
              <h2 className="mt-3 font-['Outfit'] text-3xl font-extrabold text-slate-900">Simple Solutions!</h2>
              <p className="mt-3 text-slate-600">
                A clear step-by-step flow for fast operations and smooth service delivery.
              </p>

              <div className="mt-5 space-y-2">
                {workflowItems.map((step, index) => (
                  <div
                    key={step}
                    className="subtle-hover flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-3 py-2 hover:border-orange-200"
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
                  className="cta-pulse subtle-hover rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Get Started
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="subtle-hover rounded-md border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
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
              <h2 className="mt-3 font-['Outfit'] text-3xl font-extrabold text-slate-900">Built for modern campus teams</h2>
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

            <div className="reveal-on-scroll subtle-hover grid gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md">
              {[
                { icon: UsersRound, label: "Active users", value: "18,500+" },
                { icon: Ticket, label: "Tickets resolved", value: "97.4%" },
                { icon: CalendarClock, label: "Booking success", value: "99.1%" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="subtle-hover flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-orange-200"
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
