import { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Shield,
  ClipboardCheck,
  Siren,
  ScrollText,
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
  { label: "Approvals", badge: "18", icon: ClipboardCheck, path: "/admin/bookings" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "User Management", icon: Users, path: "/admin/users" },
  { label: "Incidents", badge: "6", icon: Siren },
  { label: "Audit Trail", icon: ScrollText },
];

// Analytics data
const userRoleData = [
  { name: "Admin", value: 2, fill: "#a855f7" },
  { name: "Technician", value: 5, fill: "#3b82f6" },
  { name: "User", value: 18, fill: "#64748b" },
];

const userGrowthData = [
  { month: "Jan", users: 12, admins: 1 },
  { month: "Feb", users: 15, admins: 1 },
  { month: "Mar", users: 18, admins: 2 },
  { month: "Apr", users: 22, admins: 2 },
  { month: "May", users: 25, admins: 2 },
];

const incidentData = [
  { status: "Resolved", count: 34, fill: "#10b981" },
  { status: "In Progress", count: 12, fill: "#f59e0b" },
  { status: "Critical", count: 6, fill: "#ef4444" },
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
  { resource: "CPU", usage: 65 },
  { resource: "Memory", usage: 72 },
  { resource: "Storage", usage: 45 },
  { resource: "Network", usage: 38 },
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

export default function AnalyticsDashboardPage() {
  const auth = getAuth();
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
        sectionLabel="Admin Analytics"
        dashboardTitle="Analytics & Reports"
        dashboardSubtitle="Loading analytics data..."
        roleLabel="ADMIN"
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

  return (
    <RoleDashboardLayout
      sectionLabel="Admin Analytics"
      dashboardTitle="Analytics & Reports"
      dashboardSubtitle={error ? `Error: ${error}` : "Comprehensive system analytics and performance insights."}
      roleLabel="ADMIN"
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
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === "overview"
                  ? "border-b-2 border-orange-600 text-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="mb-1 inline-block h-4 w-4 mr-1" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === "users"
                  ? "border-b-2 border-orange-600 text-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="mb-1 inline-block h-4 w-4 mr-1" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === "performance"
                  ? "border-b-2 border-orange-600 text-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="mb-1 inline-block h-4 w-4 mr-1" />
              Performance
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* User Role Distribution */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">User Role Distribution</h3>
                {userRoleData && userRoleData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsePieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsePieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-500">No user data available</p>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">User Statistics Summary</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs text-orange-700 font-semibold uppercase">ADMINS</p>
                    <p className="text-3xl font-bold text-orange-900">{analyticsData?.admins || 0}</p>
                    <p className="text-xs text-orange-600 mt-1">System administrators</p>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs text-blue-700 font-semibold uppercase">TECHNICIANS</p>
                    <p className="text-3xl font-bold text-blue-900">{analyticsData?.technicians || 0}</p>
                    <p className="text-xs text-blue-600 mt-1">Support staff</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-700 font-semibold uppercase">REGULAR USERS</p>
                    <p className="text-3xl font-bold text-slate-900">{analyticsData?.regularUsers || 0}</p>
                    <p className="text-xs text-slate-600 mt-1">Standard accounts</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">API Performance</h3>
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
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Database Performance</h3>
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
                </div>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
