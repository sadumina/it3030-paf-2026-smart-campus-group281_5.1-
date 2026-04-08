import { useState, useEffect } from "react";
import {
  fetchTickets, fetchStats, fetchTechnicians,
  assignTechnician, deleteTicket, searchTickets,
} from "../../services/ticketService";
import TicketCard from "../../components/ticketing/TicketCard";
import TicketDetailModal from "../../components/ticketing/TicketDetailModal";

const STATUSES = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const CATEGORIES = ["ALL", "ELECTRICAL", "PLUMBING", "IT", "HVAC", "STRUCTURAL", "CLEANING", "OTHER"];

export default function AdminTicketView() {
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stats, setStats] = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [techFilter, setTechFilter] = useState("ALL");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [t, s, techs] = await Promise.all([
        fetchTickets(), fetchStats(), fetchTechnicians()
      ]);
      setTickets(t);
      setStats(s);
      setTechnicians(techs);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let result = [...tickets];
    if (statusFilter !== "ALL") result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "ALL") result = result.filter((t) => t.priority === priorityFilter);
    if (categoryFilter !== "ALL") result = result.filter((t) => t.category === categoryFilter);
    if (techFilter !== "ALL") result = result.filter((t) => t.assignedTechnicianId === techFilter);
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (t) => t.ticketId?.toLowerCase().includes(kw) ||
               t.title?.toLowerCase().includes(kw) ||
               t.description?.toLowerCase().includes(kw) ||
               t.createdByName?.toLowerCase().includes(kw)
      );
    }
    setFiltered(result);
  }, [tickets, statusFilter, priorityFilter, categoryFilter, techFilter, keyword]);

  const handleQuickAssign = async (ticketId, techId) => {
    try {
      const updated = await assignTechnician(ticketId, techId);
      setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    } catch (e) { alert("Assign failed: " + e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this ticket?")) return;
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  const statCards = [
    { label: "Total", value: stats.total || 0, color: "#f97316" },
    { label: "Open", value: stats.open || 0, color: "#3b82f6" },
    { label: "In Progress", value: stats.inProgress || 0, color: "#f97316" },
    { label: "Resolved", value: stats.resolved || 0, color: "#22c55e" },
    { label: "Closed", value: stats.closed || 0, color: "#6b7280" },
    { label: "Rejected", value: stats.rejected || 0, color: "#ef4444" },
    { label: "Critical", value: stats.critical || 0, color: "#ef4444" },
    { label: "High Priority", value: stats.high || 0, color: "#f97316" },
  ];

  return (
    <div className="tkt-page tkt-root">
      <div className="tkt-container">
        {/* Header */}
        <div className="tkt-header">
          <div className="tkt-header-left">
            <span className="tkt-header-badge">Module C — Admin Control Panel</span>
            <h1>🛠 All Tickets</h1>
            <p>Manage, assign and monitor all campus incident tickets</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="tkt-btn-secondary" onClick={loadAll}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="tkt-stats-row">
          {statCards.map((s) => (
            <div key={s.label} className="tkt-stat-card">
              <div className="tkt-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="tkt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="tkt-toolbar" style={{ flexWrap: "wrap" }}>
          <div className="tkt-search-wrap">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="tkt-search"
              placeholder="Search ID, title, description, user..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <select className="tkt-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Status" : s.replace("_", " ")}</option>)}
          </select>
          <select className="tkt-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p === "ALL" ? "All Priority" : p}</option>)}
          </select>
          <select className="tkt-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === "ALL" ? "All Category" : c}</option>)}
          </select>
          <select className="tkt-select" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
            <option value="ALL">All Technicians</option>
            {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <span style={{ fontSize: "0.78rem", color: "#71717a", alignSelf: "center" }}>
            {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="tkt-spinner" />
        ) : filtered.length === 0 ? (
          <div className="tkt-empty">
            <div className="tkt-empty-icon">📋</div>
            <h3>No tickets found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="tkt-cards-grid">
            {filtered.map((t) => (
              <div key={t.id} style={{ position: "relative" }}>
                <TicketCard
                  ticket={t}
                  onClick={() => setSelectedTicket(t)}
                  adminControls
                  technicians={technicians}
                  onAssign={handleQuickAssign}
                />
                <button
                  className="tkt-btn-danger"
                  style={{ position: "absolute", top: 10, right: 10, padding: "4px 10px", fontSize: "0.7rem", zIndex: 2 }}
                  onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={(updated) => {
            setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
            setSelectedTicket(updated);
          }}
        />
      )}
    </div>
  );
}
