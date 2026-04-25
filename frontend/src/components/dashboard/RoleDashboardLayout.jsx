import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
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
import { Breadcrumb } from "../Breadcrumb";
import { UserProfileModal } from "./UserProfileModal";
import DashboardNotificationBell from "./DashboardNotificationBell";
import { useTheme } from "../../context/ThemeContext";
import { reportExport } from "../../services/reportExport";
import { notifyAlert } from "../../services/notificationHelper";
import { userProfileService } from "../../services/userProfileService";
import { clearAuth } from "../../services/authStorage";

const dashboardContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const dashboardItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
};

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

function OperationalOverview({ kpis = [], activityFeed = [], chartTitle, chartCaption }) {
  const overviewItems = kpis.slice(0, 4);
  const activityItems = activityFeed.slice(0, 4);

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <div className="rounded-md border border-orange-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">{chartTitle}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{chartCaption}</p>
          </div>
          <span className="rounded-md border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-700">
            Live Workspace
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {overviewItems.map((item, index) => {
            const progressValues = [86, 72, 64, 91];
            const progress = progressValues[index % progressValues.length];
            const neonAccents = [
              "hover:border-orange-400 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.65),0_18px_40px_rgba(249,115,22,0.22)]",
              "hover:border-blue-400 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.65),0_18px_40px_rgba(59,130,246,0.2)]",
              "hover:border-emerald-400 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.65),0_18px_40px_rgba(16,185,129,0.2)]",
              "hover:border-amber-400 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.65),0_18px_40px_rgba(245,158,11,0.22)]",
            ];
            return (
              <article
                key={item.label}
                className={`rounded-md border border-slate-200 bg-slate-50 p-4 transition duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950 ${neonAccents[index % neonAccents.length]}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                  <span className="text-lg font-bold text-orange-600">{item.value}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.change}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-800">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${progress}%` }} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-5 rounded-md border border-orange-100 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
          <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">Today&apos;s focus</p>
          <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
            Review active requests, keep alerts updated, and resolve pending work from the action panel.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">Recent Activity</h2>
        <div className="mt-4 space-y-3">
          {activityItems.map((item) => (
            <article key={item.title} className="border-l-2 border-orange-400 bg-slate-50 px-3 py-2 dark:bg-slate-950">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.meta}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
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
  showBreadcrumb = true,
  showUtilityActions = true,
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
    <div className="dashboard-page min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-orange-100 bg-white p-4 text-slate-900 md:flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
          <div className="mb-6">
            <p className="font-display text-xl font-semibold leading-none">
              Campus<span className="text-orange-500">Flow</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-orange-600">{roleLabel}</p>
          </div>

          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const ItemIcon = item.icon;
              const currentRoute = `${location.pathname}${location.search}`;
              const isActive = item.path && currentRoute === item.path;
              const itemClassName = isActive
                ? "flex w-full items-center justify-between rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition"
                : "flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-orange-100 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-300 dark:hover:bg-slate-800";

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
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${isActive ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-md border border-orange-100 bg-orange-50 p-3 dark:border-slate-800 dark:bg-slate-800">
            <p className="text-xs uppercase tracking-wider text-orange-700 dark:text-orange-300">System Status</p>
            <p className="mt-1 text-xs font-light text-slate-600 dark:text-slate-300">
              Campus systems online and synchronized.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
          <div className="border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Smart Campus Platform
              </div>

              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{sectionLabel}</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-100">{dashboardTitle}</h1>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {dashboardSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {showUtilityActions ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <House className="h-3.5 w-3.5" />
                      Landing Page
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Search
                    </button>
                  </>
                ) : null}
                {showNotifications ? (
                  <DashboardNotificationBell />
                ) : null}
                {showUtilityActions ? (
                  <>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      title="Export as PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      title="Export as CSV"
                    >
                      <FileJson className="h-3.5 w-3.5" />
                      CSV
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-orange-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          {showBreadcrumb ? (
            <div className="border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900 md:px-6">
              <Breadcrumb />
            </div>
          ) : null}

          <motion.main
            variants={dashboardContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-1 flex-col gap-5 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 md:p-6"
          >
            <motion.div variants={dashboardItem} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, index) => {
                const cardAccents = [
                  "border-l-orange-500 hover:border-orange-300 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.65),0_18px_42px_rgba(249,115,22,0.24)]",
                  "border-l-blue-600 hover:border-blue-300 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.65),0_18px_42px_rgba(59,130,246,0.22)]",
                  "border-l-emerald-600 hover:border-emerald-300 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.65),0_18px_42px_rgba(16,185,129,0.22)]",
                  "border-l-amber-500 hover:border-amber-300 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.65),0_18px_42px_rgba(245,158,11,0.24)]",
                ];
                return (
                  <motion.article
                    key={kpi.label}
                    variants={dashboardItem}
                    whileHover={{ y: -3 }}
                    className={`cursor-pointer rounded-md border border-l-4 border-slate-200 ${cardAccents[index % 4]} bg-white p-4 shadow-sm transition duration-300 dark:border-slate-800 dark:bg-slate-900`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{kpi.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-100">{kpi.value}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{kpi.change}</p>
                  </motion.article>
                );
              })}
            </motion.div>

            {quickActions?.some((action) => action.label || action.title || action.onClick) ? (
              <motion.div variants={dashboardItem} className="flex flex-wrap gap-2">
                {quickActions
                  .filter((action) => action.label || action.title || action.onClick)
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
                            ? "bg-orange-600 text-white shadow-sm hover:bg-orange-700"
                            : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
                        {action.label || action.title}
                      </button>
                    );
                  })}
              </motion.div>
            ) : null}

            {showInsightsPanel ? (
              <motion.div variants={dashboardItem} className="flex flex-col gap-5">
                <OperationalOverview
                  kpis={kpis}
                  activityFeed={activityFeed}
                  chartTitle={chartTitle}
                  chartCaption={chartCaption}
                />
              </motion.div>
            ) : null}

            {extraContent ? extraContent : null}
          </motion.main>
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
