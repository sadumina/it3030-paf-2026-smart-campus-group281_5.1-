import { useState } from "react";
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
  ScatterChart,
  Scatter,
} from "recharts";

const adminSidebar = [
  { label: "Dashboard", icon: Shield, path: "/admin" },
  { label: "Approvals", badge: "18", icon: ClipboardCheck },
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

  const analyticsKpis = [
    { label: "Total Users", value: "25", change: "+3 this month" },
    { label: "Active Sessions", value: "12", change: "Real-time" },
    { label: "Incidents Resolved", value: "34", change: "92% SLA" },
    { label: "System Uptime", value: "99.8%", change: "Excellent" },
  ];

  return (
    <RoleDashboardLayout
      sectionLabel="Admin Analytics"
      dashboardTitle="Analytics & Reports"
      dashboardSubtitle="Comprehensive system analytics and performance insights."
      roleLabel="ADMIN"
      auth={auth}
      sidebarItems={adminSidebar}
      kpis={analyticsKpis}
      quickActions={[]}
      activityFeed={[
        { title: "Peak usage at 12:00 PM", meta: "42 concurrent logins" },
        { title: "Storage at 45% capacity", meta: "Healthy threshold" },
        { title: "All systems operational", meta: "99.8% uptime" },
      ]}
      chartTitle="System Analytics"
      chartCaption="Real-time performance metrics"
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">User Role Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
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
                </div>

                {/* Incident Status */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">Incident Status</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsePieChart>
                      <Pie
                        data={incidentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {incidentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {/* User Growth */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">User Growth Trend</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ fill: "#f97316", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="admins"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      dot={{ fill: "#a855f7", r: 3.5 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Resource Usage Bar Chart */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">System Resource Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceUsageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="resource" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="usage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="space-y-4">
              {/* Activity Timeline */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Daily Activity Timeline</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={activityData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="logins" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="approvals" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="edits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Metrics Grid */}
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
