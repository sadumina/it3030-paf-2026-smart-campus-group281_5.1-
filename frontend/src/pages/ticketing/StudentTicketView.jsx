import { useState, useEffect, useMemo } from "react";
import { fetchTickets } from "../../services/ticketService";
import { getAuth } from "../../services/authStorage";
import TicketCard from "../../components/ticketing/TicketCard";
import CreateTicketModal from "../../components/ticketing/CreateTicketModal";
import TicketDetailModal from "../../components/ticketing/TicketDetailModal";

const STATUSES = [
  { key: "ALL",         label: "All",         cls: "s-all" },
  { key: "OPEN",        label: "Open",        cls: "s-open" },
  { key: "IN_PROGRESS", label: "In Progress", cls: "s-progress" },
  { key: "RESOLVED",    label: "Resolved",    cls: "s-resolved" },
  { key: "CLOSED",      label: "Closed",      cls: "s-closed" },
  { key: "REJECTED",    label: "Rejected",    cls: "s-rejected" },
];

const PRIORITIES = [
  { key: "ALL",      label: "All",      icon: "●",  cls: "p-all" },
  { key: "CRITICAL", label: "Critical", icon: "🔴", cls: "p-critical" },
  { key: "HIGH",     label: "High",     icon: "🟠", cls: "p-high" },
  { key: "MEDIUM",   label: "Medium",   icon: "🟡", cls: "p-medium" },
  { key: "LOW",      label: "Low",      icon: "🟢", cls: "p-low" },
];

const CATEGORIES = ["ALL","ELECTRICAL","PLUMBING","IT","HVAC","STRUCTURAL","CLEANING","OTHER"];

export default function StudentTicketView() {
  const auth = getAuth();
  const [tickets, setTickets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [keyword, setKeyword]         = useState("");
  const [statusFilter, setStatus]     = useState("ALL");
  const [priorityFilter, setPriority] = useState("ALL");
  const [categoryFilter, setCategory] = useState("ALL");
  const [showCreate, setShowCreate]   = useState(false);
  const [selectedTicket, setSelected] = useState(null);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    setLoading(true);
    try { setTickets(await fetchTickets()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  };

  // Per-status counts for tab badges
  const statusCounts = useMemo(() => ({
    ALL:         tickets.length,
    OPEN:        tickets.filter(t => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter(t => t.status === "IN_PROGRESS").length,
    RESOLVED:    tickets.filter(t => t.status === "RESOLVED").length,
    CLOSED:      tickets.filter(t => t.status === "CLOSED").length,
    REJECTED:    tickets.filter(t => t.status === "REJECTED").length,
  }), [tickets]);

  // Per-priority counts for pill badges
  const priorityCounts = useMemo(() => ({
    ALL:      tickets.length,
    CRITICAL: tickets.filter(t => t.priority === "CRITICAL").length,
    HIGH:     tickets.filter(t => t.priority === "HIGH").length,
    MEDIUM:   tickets.filter(t => t.priority === "MEDIUM").length,
    LOW:      tickets.filter(t => t.priority === "LOW").length,
  }), [tickets]);

  const filtered = useMemo(() => {
    let r = [...tickets];
    if (statusFilter   !== "ALL") r = r.filter(t => t.status   === statusFilter);
    if (priorityFilter !== "ALL") r = r.filter(t => t.priority === priorityFilter);
    if (categoryFilter !== "ALL") r = r.filter(t => t.category === categoryFilter);
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      r = r.filter(t =>
        t.ticketId?.toLowerCase().includes(kw) ||
        t.title?.toLowerCase().includes(kw) ||
        t.description?.toLowerCase().includes(kw) ||
        t.location?.toLowerCase().includes(kw)
      );
    }
    return r;
  }, [tickets, statusFilter, priorityFilter, categoryFilter, keyword]);

  const hasActiveFilters = statusFilter !== "ALL" || priorityFilter !== "ALL" || categoryFilter !== "ALL" || keyword.trim();

  const clearFilters = () => {
    setStatus("ALL"); setPriority("ALL"); setCategory("ALL"); setKeyword("");
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

        {/* Stats */}
        <div className="tkt-stats-row">
          {[
            { label: "Total",       value: tickets.length,                                              color: "#f97316" },
            { label: "Open",        value: statusCounts.OPEN,                                           color: "#3b82f6" },
            { label: "In Progress", value: statusCounts.IN_PROGRESS,                                    color: "#f97316" },
            { label: "Resolved",    value: statusCounts.RESOLVED + statusCounts.CLOSED,                 color: "#22c55e" },
          ].map(s => (
            <div key={s.label} className="tkt-stat-card">
              <div className="tkt-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="tkt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div className="tkt-filter-section">

          {/* Search row */}
          <div className="tkt-filter-row">
            <span className="tkt-filter-label">Search</span>
            <div className="tkt-search-wrap" style={{ flex: 1 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="tkt-search"
                placeholder="Search by ID, title, description or location..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* Status tabs row */}
          <div className="tkt-filter-row">
            <span className="tkt-filter-label">Status</span>
            <div className="tkt-status-tabs">
              {STATUSES.map(s => (
                <button
                  key={s.key}
                  className={`tkt-status-tab ${s.cls} ${statusFilter === s.key ? "active" : ""}`}
                  onClick={() => setStatus(s.key)}
                >
                  {s.label}
                  <span className="tkt-tab-count">{statusCounts[s.key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority pills row */}
          <div className="tkt-filter-row">
            <span className="tkt-filter-label">Priority</span>
            <div className="tkt-priority-pills">
              {PRIORITIES.map(p => (
                <button
                  key={p.key}
                  className={`tkt-priority-pill ${p.cls} ${priorityFilter === p.key ? "active" : ""}`}
                  onClick={() => setPriority(p.key)}
                >
                  {p.icon} {p.label}
                  {p.key !== "ALL" && <span style={{ opacity: 0.6, fontSize: "0.68rem" }}>({priorityCounts[p.key] ?? 0})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Category + footer row */}
          <div className="tkt-filter-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="tkt-filter-label" style={{ width: "auto" }}>Category</span>
              <select className="tkt-select" value={categoryFilter} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {hasActiveFilters && (
                <button className="tkt-clear-btn" onClick={clearFilters}>
                  ✕ Clear filters
                </button>
              )}
              <span className="tkt-result-count">
                Showing <strong>{filtered.length}</strong> of {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="tkt-spinner" />
        ) : filtered.length === 0 ? (
          <div className="tkt-empty">
            <div className="tkt-empty-icon">🎫</div>
            <h3>{hasActiveFilters ? "No matching tickets" : "No tickets yet"}</h3>
            <p>{hasActiveFilters ? "Try adjusting or clearing your filters" : "Create your first incident ticket to get started"}</p>
            {hasActiveFilters && (
              <button className="tkt-btn-secondary" style={{ marginTop: 14 }} onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="tkt-cards-grid">
            {filtered.map(t => (
              <TicketCard key={t.id} ticket={t} onClick={() => setSelected(t)} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadTickets(); }}
        />
      )}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelected(null)}
          onUpdated={updated => {
            setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}
