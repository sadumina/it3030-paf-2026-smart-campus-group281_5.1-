import { useEffect, useState } from "react";
import {
  BellDot,
  ChartNoAxesCombined,
  LogOut,
  Search,
  House,
  Moon,
  Sun,
  Download,
  FileJson,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import NotificationPanel from "../NotificationPanel";
import { Breadcrumb } from "../Breadcrumb";
import { UserProfileModal } from "./UserProfileModal";
import { useTheme } from "../../context/ThemeContext";
import { reportExport } from "../../services/reportExport";
import { notifyAlert } from "../../services/notificationHelper";
import { userProfileService } from "../../services/userProfileService";
import { clearAuth } from "../../services/authStorage";

function ProfessionalChart({ points = [], color = "#ea580c" }) {
  const safePoints = points.length > 1 ? points : [28, 32, 30, 38, 36, 44, 42, 48, 50, 54, 52, 58, 60, 64];
  
  // Generate chart data with comparison metric
  const chartData = safePoints.map((value, index) => ({
    time: `${index * 10}m`,
    "Primary Metric": value,
    "Secondary Metric": Math.max(10, value - 15 + (Math.sin(index * 0.5) * 6)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <p className="text-xs font-semibold text-slate-900">{payload[0].payload.time}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={true} />
        <XAxis
          dataKey="time"
          stroke="#9ca3af"
          style={{ fontSize: "11px" }}
          tick={{ fill: "#6b7280" }}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: "11px" }}
          tick={{ fill: "#6b7280" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="Secondary Metric"
          stroke="#ec4899"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorSecondary)"
          dot={{ fill: "#ec4899", r: 3, strokeWidth: 1.5, stroke: "#fff" }}
          activeDot={{ r: 5, fill: "#ec4899", stroke: "#fff", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="Primary Metric"
          stroke="#f97316"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorPrimary)"
          dot={{ fill: "#f97316", r: 3.5, strokeWidth: 1.5, stroke: "#fff" }}
          activeDot={{ r: 5.5, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function getRoleChartSeed(roleLabel, externalSeed) {
  if (Array.isArray(externalSeed) && externalSeed.length > 4) {
    return externalSeed;
  }

  if (roleLabel === "ADMIN" || roleLabel === "SUPER_ADMIN") {
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
  sidebarItems = [],
  kpis = [],
  quickActions = [],
  activityFeed = [],
  chartTitle,
  chartCaption,
  chartPoints,
  chartColor,
  extraContent,
  showInsightsPanel = true,
  showNotifications = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const userName = auth?.name || "Campus user";
  const userEmail = auth?.email || "user@campus.local";
  const userRole = auth?.role || roleLabel || "USER";
  const [livePoints, setLivePoints] = useState(() => getRoleChartSeed(userRole, chartPoints));
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(auth || {});
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase())
    .join("") || "CU";

  const handleProfileUpdate = async (profileData) => {
    try {
      const updatedProfile = await userProfileService.updateProfile(profileData);
      setCurrentUserProfile(updatedProfile);
      notifyAlert.success('Your profile has been updated successfully');
    } catch (error) {
      notifyAlert.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const handleExportPDF = () => {
    reportExport.exportDashboardReport(kpis, `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
    notifyAlert.success('Dashboard report exported as PDF');
  };

  const handleExportCSV = () => {
    reportExport.exportToCSV(kpis, `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`);
    notifyAlert.success('Dashboard data exported as CSV');
  };

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
    <div className="dashboard-page min-h-screen p-3 md:p-4 bg-white dark:bg-slate-950">
      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <aside
          className="hidden w-64 flex-col bg-orange-600 p-4 text-white md:flex dark:bg-slate-800 "
          style={{ backgroundImage: isDark ? "linear-gradient(180deg, #1e293b 0%, #334155 52%, #475569 100%)" : "linear-gradient(180deg, #ea580c 0%, #f97316 52%, #fb923c 100%)" }}
        >
          <div className="mb-6">
            <p className="font-display text-xl font-semibold leading-none">Campus Flow</p>
            <p className="mt-0.5 text-xs uppercase tracking-widest text-orange-100">{roleLabel}</p>
          </div>

          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = item.path && location.pathname === item.path;
              const itemClassName = isActive
                ? "flex w-full items-center justify-between rounded-lg border border-white/40 bg-white/25 px-3 py-2 text-xs font-semibold text-white transition"
                : "flex w-full items-center justify-between rounded-lg border border-white/0 bg-white/0 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15";

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
                  {ItemIcon ? <ItemIcon className="h-4 w-4" /> : null}
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="rounded-full bg-orange-200 px-1.5 py-0.5 text-xs font-semibold text-orange-900">
                    {item.badge}
                  </span>
                ) : null}
              </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border border-white/25 bg-white/10 p-3">
            <p className="text-xs uppercase tracking-wider text-orange-100">System Status</p>
            <p className="mt-1 text-xs font-light text-orange-50">
              Campus systems online and synchronized.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-900">
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-medium uppercase tracking-widest text-slate-600 dark:text-slate-400">
                Smart Campus Platform
              </div>

              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{sectionLabel}</p>
                <h1 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-slate-100">{dashboardTitle}</h1>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {dashboardSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <House className="h-3.5 w-3.5" />
                  Landing Page
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search
                </button>
                {showNotifications ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <BellDot className="h-3.5 w-3.5" />
                    Alerts
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                  title="Export as PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                  title="Export as CSV"
                >
                  <FileJson className="h-3.5 w-3.5" />
                  CSV
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 dark:bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 dark:hover:bg-red-800"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 md:px-6">
            <Breadcrumb />
          </div>

          <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-5 bg-white dark:bg-slate-900">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, index) => {
                const neonColors = [
                  { bg: "from-pink-500 via-pink-600 to-red-600", border: "border-pink-400", label: "text-pink-100", value: "text-white", change: "text-pink-100", shadow: "shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80" },
                  { bg: "from-red-500 via-orange-600 to-yellow-500", border: "border-orange-400", label: "text-orange-100", value: "text-white", change: "text-orange-100", shadow: "shadow-lg shadow-orange-500/50 hover:shadow-orange-500/80" },
                  { bg: "from-green-400 via-emerald-500 to-cyan-500", border: "border-green-300", label: "text-green-100", value: "text-white", change: "text-green-100", shadow: "shadow-lg shadow-green-500/50 hover:shadow-green-500/80" },
                  { bg: "from-cyan-400 via-blue-500 to-purple-600", border: "border-cyan-300", label: "text-cyan-100", value: "text-white", change: "text-cyan-100", shadow: "shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80" },
                ];
                const color = neonColors[index % 4];
                return (
                  <article
                    key={kpi.label}
                    className={`rounded-lg border-2 ${color.border} bg-gradient-to-br ${color.bg} p-4 ${color.shadow} transition duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm`}
                  >
                    <p className={`text-xs font-semibold ${color.label} uppercase tracking-wider opacity-90`}>{kpi.label}</p>
                    <p className={`mt-1.5 text-3xl font-black ${color.value}`}>{kpi.value}</p>
                    <p className={`mt-0.5 text-xs ${color.change} opacity-90`}>{kpi.change}</p>
                  </article>
                );
              })}
            </div>

            {quickActions?.some((action) => action.label || action.onClick) ? (
              <div className="flex flex-wrap gap-2">
                {quickActions
                  .filter((action) => action.label || action.onClick)
                  .map((action, index) => {
                    const ActionIcon = action.icon;
                    const isPrimary = action.variant === "primary";
                    return (
                      <button
                        key={action.label || index}
                        type="button"
                        onClick={action.onClick}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                          isPrimary
                            ? "bg-[#a1452b] text-white shadow-lg shadow-[#a1452b]/25 hover:bg-[#873922]"
                            : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
                        {action.label || action.title}
                      </button>
                    );
                  })}
              </div>
            ) : null}

            {showInsightsPanel ? (
              <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_280px]">
                <section className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{chartTitle}</h2>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{chartCaption}</p>
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs text-orange-700 dark:text-orange-300">
                      <ChartNoAxesCombined className="h-3 w-3" />
                      Primary Metric
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 dark:bg-pink-900/30 px-2 py-0.5 text-xs text-pink-700 dark:text-pink-300">
                      <ChartNoAxesCombined className="h-3 w-3" />
                      Secondary Metric
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300">
                      Live (2.4s)
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 -mx-4">
                    <ProfessionalChart points={livePoints} color={chartColor} />
                  </div>
                </section>

                <div className="flex flex-col gap-4">
                  <section className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                    <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Live Activity</h2>
                    <div className="space-y-2">
                      {activityFeed.slice(0, 4).map((item) => (
                        <article key={item.title} className="rounded-md border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-2">
                          <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.meta}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  {showNotifications ? <NotificationPanel /> : null}
                </div>
              </div>
            ) : null}

            {extraContent ? extraContent : null}
          </main>
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUserProfile}
        onUpdateProfile={handleProfileUpdate}
      />
    </div>
  );
}
