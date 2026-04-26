import { useState, useEffect } from "react";
import {
  BarChart3,
  Activity,
  Clock,
  Database,
  PieChart,
  TrendingUp,
  Users,
  Shield,
  ClipboardCheck,
  LayoutGrid,
  Siren,
  ScrollText,
  Sparkles,
  TicketCheck,
  Server,
  Gauge,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import { fetchAnalyticsSummary } from "../services/analyticsService";
import {
  BarChart,
  Bar,
  PieChart as RechartsePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Approvals", badge: "18", icon: ClipboardCheck, path: "/admin/approvals" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Resource Matrix", icon: LayoutGrid, path: "/admin/resources" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Innovation Lab", icon: Sparkles, path: "/admin/innovation-lab", badge: "New" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText, path: "/tickets", badge: "Tickets" },
];

// Analytics data
const userRoleData = [
  { name: "Admin", value: 2, fill: "#a855f7" },
  { name: "Technician", value: 5, fill: "#3b82f6" },
  { name: "User", value: 18, fill: "#64748b" },
];

const userGrowthData = [
  { month: "Jan", users: 12, admins: 1, technicians: 2 },
  { month: "Feb", users: 15, admins: 1, technicians: 3 },
  { month: "Mar", users: 18, admins: 2, technicians: 4 },
  { month: "Apr", users: 22, admins: 2, technicians: 5 },
  { month: "May", users: 25, admins: 2, technicians: 6 },
];

const incidentData = [
  { status: "Resolved", count: 34, fill: "#10b981" },
  { status: "In Progress", count: 12, fill: "#f59e0b" },
  { status: "Critical", count: 6, fill: "#ef4444" },
  { status: "Open", count: 18, fill: "#3b82f6" },
];

const activityData = [
  { time: "0:00", logins: 12, approvals: 8, edits: 5 },
  { time: "4:00", logins: 15, approvals: 10, edits: 7 },
  { time: "8:00", logins: 28, approvals: 22, edits: 14 },
  { time: "12:00", logins: 42, approvals: 35, edits: 28 },
  { time: "16:00", logins: 38, approvals: 30, edits: 24 },
  { time: "20:00", logins: 25, approvals: 18, edits: 12 },
];

const resourceUsageData = [
  { resource: "Lecture Halls", usage: 78 },
  { resource: "Labs", usage: 64 },
  { resource: "Equipment", usage: 52 },
  { resource: "Meeting Rooms", usage: 41 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
        <p className="text-xs font-semibold text-slate-900">{label}</p>
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

function MiniStatCard({ icon: Icon, label, value, caption, color = "orange", trend = "+0%" }) {
  const tones = {
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-lg border p-2 ${tones[color] || tones.orange}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{trend}</span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{caption}</p>
    </article>
  );
}

function Panel({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function AnalyticsDashboardPage() {
  const auth = getAuth();
  const currentRole = (auth?.role || "ADMIN").toUpperCase();
  const isSuperAdmin = currentRole === "SUPER_ADMIN";
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalyticsSummary();
        setAnalyticsData(data);
        setError("");
      } catch (err) {
        setError("Failed to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <RoleDashboardLayout
        sectionLabel={isSuperAdmin ? "Super Admin Analytics" : "Admin Analytics"}
        dashboardTitle="Analytics & Reports"
        dashboardSubtitle="Loading analytics data..."
        roleLabel={currentRole}
        auth={auth}
        sidebarItems={adminSidebar}
        kpis={[]}
        quickActions={[]}
        activityFeed={[]}
        chartTitle="System Analytics"
        chartCaption="Loading..."
        chartColor="#f97316"
      />
    );
  }

  const analyticsKpis = [
    { label: "Total Users", value: String(analyticsData?.totalUsers || 0), change: `${analyticsData?.admins || 0} admins` },
    { label: "Active Sessions", value: String(analyticsData?.activeSessions || 0), change: "Real-time" },
    { label: "Technicians", value: String(analyticsData?.technicians || 0), change: "Support staff" },
    { label: "System Uptime", value: analyticsData?.systemUptime || "99.8%", change: "Excellent" },
  ];

  const userRoleData = analyticsData?.roleDistribution || [
    { name: "Admin", value: 0, fill: "#a855f7" },
    { name: "Technician", value: 0, fill: "#3b82f6" },
    { name: "User", value: 0, fill: "#64748b" },
  ];

  const totalUsers = analyticsData?.totalUsers || 0;
  const activeSessions = analyticsData?.activeSessions || 0;
  const technicians = analyticsData?.technicians || 0;
  const admins = analyticsData?.admins || 0;
  const regularUsers = analyticsData?.regularUsers || Math.max(totalUsers - admins - technicians, 0);
  const utilizationAverage = Math.round(
    resourceUsageData.reduce((sum, item) => sum + item.usage, 0) / resourceUsageData.length,
  );

  return (
    <RoleDashboardLayout
      sectionLabel={isSuperAdmin ? "Super Admin Analytics" : "Admin Analytics"}
      dashboardTitle="Analytics & Reports"
      dashboardSubtitle={error ? `Error: ${error}` : "Comprehensive system analytics and performance insights."}
      roleLabel={currentRole}
      auth={auth}
      sidebarItems={adminSidebar}
      kpis={analyticsKpis}
      quickActions={[]}
      activityFeed={[
        { title: `Total ${analyticsData?.totalUsers || 0} users registered`, meta: "From database" },
        { title: `${analyticsData?.technicians || 0} technicians on staff`, meta: "Support team" },
        { title: `${analyticsData?.admins || 0} admin accounts active`, meta: "System administrators" },
      ]}
      chartTitle="User Statistics"
      chartCaption="Real-time user data from database"
      chartColor="#f97316"
      extraContent={
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MiniStatCard
              icon={Users}
              label="User Coverage"
              value={totalUsers}
              caption={`${regularUsers} standard accounts`}
              color="orange"
              trend="+12%"
            />
            <MiniStatCard
              icon={TicketCheck}
              label="Incident Load"
              value={incidentData.reduce((sum, item) => sum + item.count, 0)}
              caption="Open, active, and resolved tickets"
              color="blue"
              trend="-8%"
            />
            <MiniStatCard
              icon={LayoutGrid}
              label="Resource Use"
              value={`${utilizationAverage}%`}
              caption="Average booking utilization"
              color="emerald"
              trend="+6%"
            />
            <MiniStatCard
              icon={Server}
              label="Platform Health"
              value={analyticsData?.systemUptime || "99.8%"}
              caption="Service availability"
              color="slate"
              trend="Live"
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <button
              onClick={() => setActiveTab("overview")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === "overview"
                  ? "bg-orange-600 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="mb-1 inline-block h-4 w-4 mr-1" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === "users"
                  ? "bg-orange-600 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="mb-1 inline-block h-4 w-4 mr-1" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === "performance"
                  ? "bg-orange-600 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="mb-1 inline-block h-4 w-4 mr-1" />
              Performance
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Panel title="Operational Activity" subtitle="Logins, approvals, and administrative edits across the day.">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="activityLogins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="activityApprovals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="logins" name="Logins" stroke="#f97316" strokeWidth={2.5} fill="url(#activityLogins)" />
                      <Area type="monotone" dataKey="approvals" name="Approvals" stroke="#3b82f6" strokeWidth={2.5} fill="url(#activityApprovals)" />
                      <Line type="monotone" dataKey="edits" name="Admin Edits" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Panel>

                <Panel title="Incident Pipeline" subtitle="Ticket movement across active support states.">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={incidentData} layout="vertical" margin={{ left: 14, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="status" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={82} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Tickets" radius={[0, 8, 8, 0]}>
                        {incidentData.map((entry) => (
                          <Cell key={entry.status} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {resourceUsageData.map((item) => (
                  <article key={item.resource} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{item.resource}</p>
                      <span className="text-sm font-bold text-orange-600">{item.usage}%</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${item.usage}%` }} />
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Current utilization against monthly capacity.</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <Panel title="User Role Distribution" subtitle="Current account split by role.">
                  {userRoleData && userRoleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsePieChart>
                        <Pie
                          data={userRoleData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={92}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {userRoleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-slate-500">No user data available</p>
                  )}
                </Panel>

                <Panel title="Account Growth" subtitle="Monthly growth across users, admins, and technicians.">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="users" name="Users" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="technicians" name="Technicians" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="admins" name="Admins" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              <Panel title="User Statistics Summary" subtitle="Role totals pulled from the analytics summary.">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs text-orange-700 font-semibold uppercase">ADMINS</p>
                    <p className="text-3xl font-bold text-orange-900">{admins}</p>
                    <p className="text-xs text-orange-600 mt-1">System administrators</p>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs text-blue-700 font-semibold uppercase">TECHNICIANS</p>
                    <p className="text-3xl font-bold text-blue-900">{technicians}</p>
                    <p className="text-xs text-blue-600 mt-1">Support staff</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-700 font-semibold uppercase">REGULAR USERS</p>
                    <p className="text-3xl font-bold text-slate-900">{regularUsers}</p>
                    <p className="text-xs text-slate-600 mt-1">Standard accounts</p>
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <MiniStatCard icon={Activity} label="Active Sessions" value={activeSessions} caption="Current authenticated sessions" color="blue" trend="Live" />
                <MiniStatCard icon={Clock} label="Avg Response" value="245ms" caption="API response average" color="emerald" trend="-15%" />
                <MiniStatCard icon={Database} label="DB Query Time" value="156ms" caption="Average query latency" color="slate" trend="-9%" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Panel title="API Performance" subtitle="Response time and service reliability.">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Avg Response Time</span>
                      <span className="text-sm font-semibold text-slate-900">245ms</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-full w-3/4 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Error Rate</span>
                      <span className="text-sm font-semibold text-slate-900">0.12%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-full w-1/12 rounded-full bg-green-500" />
                    </div>
                  </div>
                </Panel>

                <Panel title="Database Performance" subtitle="Connection usage and query timing.">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Query Time</span>
                      <span className="text-sm font-semibold text-slate-900">156ms</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-full w-1/2 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Connections</span>
                      <span className="text-sm font-semibold text-slate-900">28/50</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-full w-7/12 rounded-full bg-orange-500" />
                    </div>
                  </div>
                </Panel>
              </div>

              <Panel title="Capacity Profile" subtitle="Resource utilization shown as compact operational bars.">
                <div className="grid gap-3 md:grid-cols-2">
                  {resourceUsageData.map((item) => (
                    <div key={item.resource} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <Gauge className="h-4 w-4 text-orange-500" />
                          {item.resource}
                        </span>
                        <span className="text-xs font-bold text-slate-600">{item.usage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white">
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${item.usage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
              </div>
          )}
        </div>
      }
    />
  );
}
