import { useState, useEffect } from "react";
import { fetchTickets, updateTicketStatus } from "../../services/ticketService";
import { getAuth } from "../../services/authStorage";
import TicketCard from "../../components/ticketing/TicketCard";
import TicketDetailModal from "../../components/ticketing/TicketDetailModal";

export default function TechnicianTicketView() {
  const auth = getAuth();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let result = [...tickets];
    if (statusFilter !== "ALL") result = result.filter((t) => t.status === statusFilter);
    setFiltered(result);
  }, [tickets, statusFilter]);

  const counts = {
    total: tickets.length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    open: tickets.filter((t) => t.status === "OPEN").length,
  };

  return (
    <div className="tkt-page tkt-root">
      <div className="tkt-container">
        {/* Header */}
        <div className="tkt-header">
          <div className="tkt-header-left">
            <span className="tkt-header-badge">Module C — Technician Workload</span>
            <h1>🔧 My Assigned Tickets</h1>
            <p>Manage and resolve your assigned campus incidents, {auth?.name}</p>
          </div>
          <button className="tkt-btn-secondary" onClick={loadTickets}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="tkt-stats-row">
          <div className="tkt-stat-card">
            <div className="tkt-stat-value">{counts.total}</div>
            <div className="tkt-stat-label">Assigned</div>
          </div>
          <div className="tkt-stat-card">
            <div className="tkt-stat-value" style={{ color: "#3b82f6" }}>{counts.open}</div>
            <div className="tkt-stat-label">Open</div>
          </div>
          <div className="tkt-stat-card">
            <div className="tkt-stat-value" style={{ color: "#f97316" }}>{counts.inProgress}</div>
            <div className="tkt-stat-label">In Progress</div>
          </div>
          <div className="tkt-stat-card">
            <div className="tkt-stat-value" style={{ color: "#22c55e" }}>{counts.resolved}</div>
            <div className="tkt-stat-label">Resolved</div>
          </div>
        </div>

        {/* Filter */}
        <div className="tkt-toolbar">
          <select className="tkt-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
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
            <div className="tkt-empty-icon">🔧</div>
            <h3>No tickets assigned</h3>
            <p>You have no tickets yet. Check back later.</p>
          </div>
        ) : (
          <div className="tkt-cards-grid">
            {filtered.map((t) => (
              <TicketCard key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
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
