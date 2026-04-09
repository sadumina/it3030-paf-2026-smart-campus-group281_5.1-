import { useEffect, useState } from "react";
import {
  BellDot,
  ChartNoAxesCombined,
  LogOut,
  Search,
  UserCircle2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationPanel from "../NotificationPanel";
import { clearAuth } from "../../services/authStorage";

function SparkLineChart({ points = [], color = "#ea580c" }) {
  const safePoints = points.length > 1 ? points : [20, 25, 22, 30, 28, 34, 36];
  const min = Math.min(...safePoints);
  const max = Math.max(...safePoints);
  const range = Math.max(max - min, 1);

  const polyline = safePoints
    .map((value, index) => {
      const x = (index / (safePoints.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-56 w-full" preserveAspectRatio="none" role="img" aria-label="Trend chart">
      <defs>
        <linearGradient id="dashboard-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <g>
        {[20, 40, 60, 80].map((tick) => (
          <line
            key={tick}
            x1="0"
            y1={tick}
            x2="100"
            y2={tick}
            stroke="#fed7aa"
            strokeWidth="0.7"
            strokeDasharray="2 3"
          />
        ))}
      </g>
      <polyline points={`0,100 ${polyline} 100,100`} fill="url(#dashboard-chart-fill)" stroke="none" />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getRoleChartSeed(roleLabel, externalSeed) {
  if (Array.isArray(externalSeed) && externalSeed.length > 4) {
    return externalSeed;
  }

  if (roleLabel === "ADMIN") {
    return [42, 40, 47, 45, 54, 52, 60, 57, 63, 61, 68, 66, 74, 79];
  }

  if (roleLabel === "TECHNICIAN") {
    return [31, 34, 33, 37, 40, 39, 43, 45, 44, 49, 52, 50, 55, 57];
  }

  return [22, 24, 21, 27, 25, 31, 29, 33, 32, 36, 35, 39, 38, 43];
}

export default function RoleDashboardLayout({
  sectionLabel,
  dashboardTitle,
  dashboardSubtitle,
  roleLabel,
  auth,
  sidebarItems,
  kpis,
  quickActions,
  activityFeed,
  chartTitle,
  chartCaption,
  chartPoints,
  chartColor,
  extraContent,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = auth?.name || "Campus user";
  const userEmail = auth?.email || "user@campus.local";
  const userRole = auth?.role || roleLabel || "USER";
  const [livePoints, setLivePoints] = useState(() => getRoleChartSeed(userRole, chartPoints));
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase())
    .join("") || "CU";

  useEffect(() => {
    setLivePoints(getRoleChartSeed(userRole, chartPoints));
  }, [userRole, chartPoints]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLivePoints((previous) => {
        const last = previous[previous.length - 1] || 50;
        const delta = Math.floor(Math.random() * 15) - 7;
        const next = Math.min(92, Math.max(12, last + delta));
        return [...previous.slice(-13), next];
      });
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="dashboard-page min-h-screen p-3 md:p-4">
      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1450px] overflow-hidden rounded-[2rem] border border-orange-200 bg-white shadow-[0_30px_80px_rgba(194,65,12,0.2)]">
        <div className="dashboard-glow dashboard-glow-left" />
        <div className="dashboard-glow dashboard-glow-right" />

        <aside
          className="hidden w-72 flex-col bg-campusOrange-600 p-5 text-white md:flex"
          style={{ backgroundImage: "linear-gradient(180deg, #ea580c 0%, #f97316 52%, #fb923c 100%)" }}
        >
          <div className="mb-8">
            <p className="font-display text-3xl font-semibold leading-none">Campus Flow</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-orange-100">{roleLabel}</p>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = item.path && location.pathname === item.path;
              const itemClassName = isActive
                ? "flex w-full items-center justify-between rounded-xl border border-white/45 bg-white/25 px-3 py-2 text-sm font-semibold text-white transition"
                : "flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20";

              return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={itemClassName}
              >
                <span className="inline-flex items-center gap-2">
                  {ItemIcon ? <ItemIcon className="h-4 w-4 text-orange-100" /> : null}
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="rounded-full bg-orange-100/95 px-2 py-0.5 text-xs font-semibold text-orange-700">
                    {item.badge}
                  </span>
                ) : null}
              </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/25 bg-white/15 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-orange-100">System pulse</p>
            <p className="mt-1 text-xs text-orange-50">
              Real-time campus workflows are synchronized for approvals, maintenance, and service requests.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-orange-50/45">
          <div className="border-b border-orange-100 bg-white px-4 py-2.5 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Smart Campus Platform
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-campusOrange-600 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold leading-tight text-slate-900">{userName}</p>
                  <p className="text-[11px] text-slate-500">{userEmail}</p>
                </div>
                <UserCircle2 className="h-4 w-4 text-campusOrange-600" />
              </div>
            </div>
          </div>

          <header className="border-b border-orange-100 bg-white/85 px-4 py-3 backdrop-blur-sm md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-campusOrange-600">{sectionLabel}</p>
                <h1 className="font-display text-2xl font-semibold leading-tight text-slate-900 md:text-3xl">{dashboardTitle}</h1>
                <p className="text-sm text-slate-600">
                  {dashboardSubtitle} Welcome, {userName} ({userRole}).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-slate-500 md:flex">
                  <Search className="h-4 w-4 text-campusOrange-500" />
                  <span>Search modules</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-campusOrange-700 transition hover:bg-orange-50"
                >
                  <BellDot className="h-4 w-4" />
                  Alerts
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-xl bg-campusOrange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-campusOrange-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 md:hidden">
              {sidebarItems.slice(0, 4).map((item) => (
                <span
                  key={item.label}
                  className="rounded-full border border-orange-200 bg-orange-100/70 px-2.5 py-1 text-xs font-semibold text-campusOrange-700"
                >
                  {item.label}
                </span>
              ))}
            </div>
          </header>

          <main className="grid flex-1 gap-4 overflow-y-auto p-4 md:p-6 xl:grid-cols-[1.55fr_0.95fr]">
            <section className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((kpi) => (
                  <article
                    key={kpi.label}
                    className="dashboard-soft-in rounded-2xl border border-orange-200 bg-white p-4 shadow-[0_10px_25px_rgba(251,146,60,0.12)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{kpi.label}</p>
                    <p className="mt-1.5 font-display text-2xl font-semibold text-slate-900">{kpi.value}</p>
                    <p className="mt-1 text-xs font-medium text-campusOrange-700">{kpi.change}</p>
                  </article>
                ))}
              </div>

              <section className="dashboard-soft-in rounded-2xl border border-orange-200 bg-white p-4 shadow-[0_16px_35px_rgba(251,146,60,0.12)]">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-slate-900">{chartTitle}</h2>
                    <p className="text-sm text-slate-500">{chartCaption}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-campusOrange-700">
                    <ChartNoAxesCombined className="h-3.5 w-3.5" />
                    Live (2.4s)
                  </div>
                </div>

                <SparkLineChart points={livePoints} color={chartColor} />
              </section>

              {quickActions?.length ? (
                <section className="dashboard-soft-in rounded-2xl border border-orange-200 bg-white p-4 shadow-[0_14px_28px_rgba(251,146,60,0.12)]">
                  <h2 className="mb-3 font-display text-xl font-semibold text-slate-900">Quick Actions</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {quickActions.map((action) => (
                      <article key={action.title} className="rounded-xl border border-orange-100 bg-orange-50/55 p-3">
                        <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{action.description}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {extraContent ? extraContent : null}
            </section>

            <section className="space-y-4">
              <section className="dashboard-soft-in rounded-2xl border border-orange-200 bg-white p-4 shadow-[0_14px_28px_rgba(251,146,60,0.11)]">
                <h2 className="mb-3 font-display text-xl font-semibold text-slate-900">Live Activity</h2>
                <div className="space-y-2.5">
                  {activityFeed.map((item) => (
                    <article key={item.title} className="rounded-xl border border-orange-100 bg-orange-50/50 p-3">
                      <p className="text-sm font-semibold leading-tight text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.meta}</p>
                    </article>
                  ))}
                </div>
              </section>

              <NotificationPanel />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
