import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "../components/NotificationPanel";
import { clearAuth, getAuth } from "../services/authStorage";

const roleCards = {
  USER: [
    { title: "Book Resource", description: "Request room/lab/equipment bookings." },
    { title: "My Bookings", description: "Track pending and approved bookings." },
    { title: "Report Incident", description: "Create maintenance and fault tickets." },
  ],
  ADMIN: [
    { title: "Review Bookings", description: "Approve or reject booking requests." },
    { title: "Manage Resources", description: "Maintain facility and asset catalogue." },
    { title: "Role Management", description: "Assign ADMIN/TECHNICIAN permissions." },
  ],
  TECHNICIAN: [
    { title: "Assigned Tickets", description: "View active maintenance tickets." },
    { title: "Update Status", description: "Move tickets to IN_PROGRESS/RESOLVED." },
    { title: "Resolution Notes", description: "Add evidence and closure notes." },
  ],
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const auth = getAuth();

  const cards = useMemo(() => {
    const role = (auth?.role || "USER").toUpperCase();
    return roleCards[role] || roleCards.USER;
  }, [auth?.role]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8ea_0%,#f7fbff_45%,#eef3ff_100%)] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">Smart Campus Hub</p>
              <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
              <p className="text-sm text-slate-600">
                Welcome, {auth?.name || "User"} ({auth?.role || "USER"})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Module Shortcuts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <article key={card.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{card.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900">Team integration flow</h3>
              <p className="mt-1 text-sm text-blue-800">
                Member 1 handles resources, Member 2 booking workflow, Member 3 incidents, and your auth/notification
                layer powers secure access and updates across all modules.
              </p>
            </div>
          </section>

          <NotificationPanel />
        </main>
      </div>
    </div>
  );
}
