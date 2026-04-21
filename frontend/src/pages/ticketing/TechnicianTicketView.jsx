import { useState, useEffect, useMemo } from "react";
import { fetchTickets } from "../../services/ticketService";
import { getAuth } from "../../services/authStorage";
import TicketCard from "../../components/ticketing/TicketCard";
import TicketDetailModal from "../../components/ticketing/TicketDetailModal";

const STATUSES = [
  { key: "ALL",         label: "All",         cls: "s-all" },
  { key: "OPEN",        label: "Open",        cls: "s-open" },
  { key: "IN_PROGRESS", label: "In Progress", cls: "s-progress" },
  { key: "RESOLVED",    label: "Resolved",    cls: "s-resolved" },
];

const PRIORITIES = [
  { key: "ALL",      label: "All",      icon: "●",  cls: "p-all" },
  { key: "CRITICAL", label: "Critical", icon: "🔴", cls: "p-critical" },
  { key: "HIGH",     label: "High",     icon: "🟠", cls: "p-high" },
  { key: "MEDIUM",   label: "Medium",   icon: "🟡", cls: "p-medium" },
  { key: "LOW",      label: "Low",      icon: "🟢", cls: "p-low" },
];

const CATEGORIES = ["ALL","ELECTRICAL","PLUMBING","IT","HVAC","STRUCTURAL","CLEANING","OTHER"];

export default function TechnicianTicketView() {
  const auth = getAuth();
  const [tickets, setTickets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [keyword, setKeyword]         = useState("");
  const [statusFilter, setStatus]     = useState("ALL");
  const [priorityFilter, setPriority] = useState("ALL");
  const [categoryFilter, setCategory] = useState("ALL");
  const [selectedTicket, setSelected] = useState(null);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    setLoading(true);
    try { setTickets(await fetchTickets()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const statusCounts = useMemo(() => ({
    ALL:         tickets.length,
    OPEN:        tickets.filter(t => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter(t => t.status === "IN_PROGRESS").length,
    RESOLVED:    tickets.filter(t => t.status === "RESOLVED").length,
  }), [tickets]);

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
        t.location?.toLowerCase().includes(kw) ||
        t.createdByName?.toLowerCase().includes(kw)
      );
    }
    return r;
  }, [tickets, statusFilter, priorityFilter, categoryFilter, keyword]);

  const hasActiveFilters = statusFilter !== "ALL" || priorityFilter !== "ALL" || categoryFilter !== "ALL" || keyword.trim();
  const clearFilters = () => { setStatus("ALL"); setPriority("ALL"); setCategory("ALL"); setKeyword(""); };

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
          {[
            { label: "Assigned",    value: tickets.length,              color: "#f97316" },
            { label: "Open",        value: statusCounts.OPEN,           color: "#3b82f6" },
            { label: "In Progress", value: statusCounts.IN_PROGRESS,    color: "#f97316" },
            { label: "Resolved",    value: statusCounts.RESOLVED,       color: "#22c55e" },
          ].map(s => (
            <div key={s.label} className="tkt-stat-card">
              <div className="tkt-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="tkt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div className="tkt-filter-section">

          {/* Search */}
          <div className="tkt-filter-row">
            <span className="tkt-filter-label">Search</span>
            <div className="tkt-search-wrap" style={{ flex: 1 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="tkt-search"
                placeholder="Search by ID, title, location or requester..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* Status tabs */}
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

          {/* Priority pills */}
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

          {/* Category + footer */}
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
                <button className="tkt-clear-btn" onClick={clearFilters}>✕ Clear filters</button>
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
            <div className="tkt-empty-icon">🔧</div>
            <h3>{hasActiveFilters ? "No matching tickets" : "No tickets assigned"}</h3>
            <p>{hasActiveFilters ? "Try adjusting or clearing your filters" : "You have no assigned tickets. Check back later."}</p>
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
