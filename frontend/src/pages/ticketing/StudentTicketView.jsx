import { useState, useEffect } from "react";
import { fetchTickets, searchTickets } from "../../services/ticketService";
import { getAuth } from "../../services/authStorage";
import TicketCard from "../../components/ticketing/TicketCard";
import CreateTicketModal from "../../components/ticketing/CreateTicketModal";
import TicketDetailModal from "../../components/ticketing/TicketDetailModal";

export default function StudentTicketView() {
  const auth = getAuth();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets();
      setTickets(data);
      setFiltered(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let result = [...tickets];
    if (statusFilter !== "ALL") result = result.filter((t) => t.status === statusFilter);
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (t) => t.ticketId?.toLowerCase().includes(kw) ||
               t.title?.toLowerCase().includes(kw) ||
               t.description?.toLowerCase().includes(kw)
      );
    }
    setFiltered(result);
  }, [tickets, statusFilter, keyword]);

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length,
  };

  return (
    <div className="tkt-page tkt-root">
      <div className="tkt-container">
        {/* Header */}
        <div className="tkt-header">
          <div className="tkt-header-left">
            <span className="tkt-header-badge">Module C — Ticketing</span>
            <h1>🎫 My Tickets</h1>
            <p>Track and manage your incident reports, {auth?.name}</p>
          </div>
          <button className="tkt-btn-primary" onClick={() => setShowCreate(true)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </button>
        </div>

        {/* Stats row */}
        <div className="tkt-stats-row">
          <div className="tkt-stat-card">
            <div className="tkt-stat-value">{counts.total}</div>
            <div className="tkt-stat-label">Total</div>
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

        {/* Toolbar */}
        <div className="tkt-toolbar">
          <div className="tkt-search-wrap">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="tkt-search"
              placeholder="Search by ID, title or description..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <select className="tkt-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="tkt-spinner" />
        ) : filtered.length === 0 ? (
          <div className="tkt-empty">
            <div className="tkt-empty-icon">🎫</div>
            <h3>{keyword || statusFilter !== "ALL" ? "No matching tickets" : "No tickets yet"}</h3>
            <p>{keyword || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Create your first incident ticket to get started"}
            </p>
          </div>
        ) : (
          <div className="tkt-cards-grid">
            {filtered.map((t) => (
              <TicketCard key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={(t) => { setShowCreate(false); loadTickets(); }}
        />
      )}
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
