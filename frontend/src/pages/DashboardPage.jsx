import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  DoorOpen,
  LayoutGrid,
  Wrench,
} from "lucide-react";
import { getAuth } from "../services/authStorage";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { userActivity, userActions, userKpis, userSidebar } from "../config/userDashboardConfig";

const availabilityStats = [
  { label: "Available Today", value: "12", caption: "Rooms and equipment ready", icon: CheckCircle2, color: "emerald" },
  { label: "Booked Today", value: "08", caption: "Confirmed reservations", icon: CalendarDays, color: "blue" },
  { label: "Pending Approval", value: "03", caption: "Awaiting admin review", icon: CalendarClock, color: "orange" },
  { label: "Maintenance", value: "02", caption: "Temporarily unavailable", icon: Wrench, color: "rose" },
];

const nextOpenSlots = [
  { name: "Innovation Lab B", type: "Engineering Block", time: "2:00 PM - 4:00 PM", status: "Available now" },
  { name: "Seminar Room 2", type: "Main Academic Wing", time: "12:30 PM - 3:00 PM", status: "Next slot" },
  { name: "Projector Kit A", type: "Media Desk", time: "All afternoon", status: "Equipment ready" },
];

export function AvailabilityPanel() {
  const navigate = useNavigate();
  const tone = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Availability</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">Today&apos;s Resource Availability</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Check what is free, what is booked, and the next open slots before creating a reservation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/resources")}
            className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-700"
          >
            <DoorOpen className="h-4 w-4" />
            Book Resource
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/bookings")}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <LayoutGrid className="h-4 w-4" />
            View Calendar
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {availabilityStats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-md border p-2 ${tone[item.color]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-slate-950 dark:text-slate-100">{item.value}</p>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.caption}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">Next Open Slots</h3>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {nextOpenSlots.map((slot) => (
              <div key={slot.name} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{slot.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{slot.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{slot.time}</p>
                  <p className="text-xs font-medium text-emerald-600">{slot.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
          <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">Quick suggestion</h3>
          <p className="mt-2 text-sm text-orange-800 dark:text-orange-200">
            Innovation Lab B has the longest free slot today. Book it now if you need a lab space for group work.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/resources")}
            className="mt-4 w-full rounded-md bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-700"
          >
            Check all resources
          </button>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <RoleDashboardLayout
      sectionLabel="User Workspace"
      dashboardTitle="CleverCampus Dashboard"
      dashboardSubtitle="Manage bookings, requests, and alerts in one place."
      roleLabel="USER"
      auth={getAuth()}
      sidebarItems={userSidebar}
      kpis={userKpis}
      quickActions={userActions}
      activityFeed={userActivity}
      chartTitle="Booking and request trend"
      chartCaption="Live booking and request trend."
      chartColor="#fb923c"
      extraContent={<AvailabilityPanel />}
    />
  );
}

