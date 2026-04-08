import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "../components/NotificationPanel";
import { clearAuth, getAuth } from "../services/authStorage";

const roleCards = {
  USER: [
    { title: "Book Resource", description: "Request room/lab/equipment bookings.", icon: "📦", link: null },
    { title: "My Bookings", description: "Track pending and approved bookings.", icon: "📅", link: null },
    { title: "Report Incident", description: "Create and track maintenance tickets.", icon: "🎫", link: "/tickets", highlight: true },
  ],
  ADMIN: [
    { title: "Review Bookings", description: "Approve or reject booking requests.", icon: "✅", link: null },
    { title: "Manage Resources", description: "Maintain facility and asset catalogue.", icon: "🏢", link: null },
    { title: "Ticketing Control Panel", description: "Manage all incident tickets, assign technicians.", icon: "🛠", link: "/tickets", highlight: true },
  ],
  TECHNICIAN: [
    { title: "Assigned Tickets", description: "View and resolve your active maintenance tickets.", icon: "🔧", link: "/tickets", highlight: true },
    { title: "Update Status", description: "Move tickets to IN_PROGRESS / RESOLVED.", icon: "↻", link: "/tickets" },
    { title: "Resolution Notes", description: "Add evidence and closure notes.", icon: "📝", link: "/tickets" },
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
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={() => navigate("/tickets")}
                style={{
                  padding: "8px 18px",
                  background: "linear-gradient(135deg, #f97316, #c2410c)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                🎫 Ticketing System
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Module Shortcuts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <article
                  key={card.title}
                  onClick={() => card.link && navigate(card.link)}
                  className="rounded-xl border p-4"
                  style={{
                    cursor: card.link ? "pointer" : "default",
                    borderColor: card.highlight ? "#f97316" : "#e2e8f0",
                    background: card.highlight
                      ? "linear-gradient(135deg, #fff7ed, #ffedd5)"
                      : "#f8fafc",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    boxShadow: card.highlight ? "0 4px 12px rgba(249,115,22,0.12)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (card.link) e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: "1.3rem" }}>{card.icon}</span>
                    <h3 className="font-semibold text-slate-900">{card.title}</h3>
                    {card.link && (
                      <span style={{
                        marginLeft: "auto", fontSize: "0.65rem", fontWeight: 700,
                        background: "#f97316", color: "#fff", borderRadius: 99,
                        padding: "2px 8px", letterSpacing: "0.08em",
                      }}>LIVE</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{card.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <h3 className="font-semibold text-orange-900">🎫 Module C — Ticketing System Active</h3>
              <p className="mt-1 text-sm text-orange-800">
                The Maintenance &amp; Incident Ticketing System is live. Students can raise tickets,
                Admins can assign technicians, and Technicians can resolve and add resolution notes.
              </p>
              <button
                onClick={() => navigate("/tickets")}
                style={{
                  marginTop: 10,
                  padding: "7px 16px",
                  background: "#f97316",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Open Ticketing System →
              </button>
            </div>
          </section>

          <NotificationPanel />
        </main>
      </div>
    </div>
  );
}
