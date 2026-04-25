import { useState, useEffect, useMemo, useRef } from "react";
import {
  fetchTickets, fetchTechnicians,
  assignTechnician, deleteTicket,
} from "../../services/ticketService";
import TicketCard from "../../components/ticketing/TicketCard";
import TicketDetailModal from "../../components/ticketing/TicketDetailModal";
import { fetchCurrentUser } from "../../services/authService";
import { clearAuth, getAuth, getToken, saveAuth } from "../../services/authStorage";

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

function normalizeRole(role) {
  return (role || "")
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/\s+/g, "_");
}

function isAdminRole(role) {
  const normalized = normalizeRole(role);
  return normalized === "ADMIN" || normalized === "SUPER_ADMIN";
}

export default function AdminTicketView({ embedded = false }) {
  const [allTickets, setAllTickets]   = useState([]);
  const [apiTickets, setApiTickets]   = useState([]);
  const [stats, setStats]             = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedTicket, setSelected] = useState(null);

  const [keyword, setKeyword]         = useState("");
  const [statusFilter, setStatus]     = useState("ALL");
  const [priorityFilter, setPriority] = useState("ALL");
  const [categoryFilter, setCategory] = useState("ALL");
  const [techFilter, setTechFilter]   = useState("ALL");
  const initialized = useRef(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const currentUser = await fetchCurrentUser(token);

      if (!isAdminRole(currentUser?.role)) {
        setAccessDenied(true);
        setAllTickets([]);
        setApiTickets([]);
        setStats({});
        setTechnicians([]);
        return;
      }

      saveAuth({
        ...(getAuth() || {}),
        ...currentUser,
        token: currentUser.token || token,
      });
      setAccessDenied(false);
      const [t, techs] = await Promise.all([fetchTickets(), fetchTechnicians()]);
      setAllTickets(t);
      setApiTickets(t);
      setStats({
        total: t.length,
        open: t.filter((ticket) => ticket.status === "OPEN").length,
        inProgress: t.filter((ticket) => ticket.status === "IN_PROGRESS").length,
        resolved: t.filter((ticket) => ticket.status === "RESOLVED").length,
        closed: t.filter((ticket) => ticket.status === "CLOSED").length,
        rejected: t.filter((ticket) => ticket.status === "REJECTED").length,
        critical: t.filter((ticket) => ticket.priority === "CRITICAL").length,
        high: t.filter((ticket) => ticket.priority === "HIGH").length,
      });
      setTechnicians(techs);
    } catch {
      clearAuth();
      setAccessDenied(true);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  // Re-fetch when API-level filters change (status / priority / category sent to server)
  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return; }
    let active = true;
    setLoading(true);
    fetchTickets({ status: statusFilter, priority: priorityFilter, category: categoryFilter })
      .then(data => { if (active) setApiTickets(data); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Count badges always from the unfiltered full set
  const statusCounts = useMemo(() => ({
    ALL:         allTickets.length,
    OPEN:        allTickets.filter(t => t.status === "OPEN").length,
    IN_PROGRESS: allTickets.filter(t => t.status === "IN_PROGRESS").length,
    RESOLVED:    allTickets.filter(t => t.status === "RESOLVED").length,
    CLOSED:      allTickets.filter(t => t.status === "CLOSED").length,
    REJECTED:    allTickets.filter(t => t.status === "REJECTED").length,
  }), [allTickets]);

  const priorityCounts = useMemo(() => ({
    ALL:      allTickets.length,
    CRITICAL: allTickets.filter(t => t.priority === "CRITICAL").length,
    HIGH:     allTickets.filter(t => t.priority === "HIGH").length,
    MEDIUM:   allTickets.filter(t => t.priority === "MEDIUM").length,
    LOW:      allTickets.filter(t => t.priority === "LOW").length,
  }), [allTickets]);

  // Technician filter + keyword are applied client-side on top of the API response
  const filtered = useMemo(() => {
    let r = techFilter !== "ALL"
      ? apiTickets.filter(t => t.assignedTechnicianId === techFilter)
      : apiTickets;
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      r = r.filter(t =>
        t.ticketId?.toLowerCase().includes(kw) ||
        t.title?.toLowerCase().includes(kw) ||
        t.description?.toLowerCase().includes(kw) ||
        t.createdByName?.toLowerCase().includes(kw) ||
        t.location?.toLowerCase().includes(kw)
      );
    }
    return r;
  }, [apiTickets, techFilter, keyword]);

  const hasActiveFilters = statusFilter !== "ALL" || priorityFilter !== "ALL" ||
    categoryFilter !== "ALL" || techFilter !== "ALL" || keyword.trim();

  const clearFilters = () => {
    setStatus("ALL"); setPriority("ALL"); setCategory("ALL"); setTechFilter("ALL"); setKeyword("");
  };

  const handleQuickAssign = async (ticketId, techId) => {
    try {
      const updated = await assignTechnician(ticketId, techId);
      const patch = prev => prev.map(t => t.id === updated.id ? updated : t);
      setAllTickets(patch); setApiTickets(patch);
    } catch (e) { alert("Assign failed: " + e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this ticket?")) return;
    try {
      await deleteTicket(id);
      const remove = prev => prev.filter(t => t.id !== id);
      setAllTickets(remove); setApiTickets(remove);
      if (selectedTicket?.id === id) setSelected(null);
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  const statCards = [
    { label: "Incidents",   value: statusCounts.ALL      || 0, color: "#f97316" },
    { label: "Open",        value: statusCounts.OPEN     || 0, color: "#3b82f6" },
    { label: "In Progress", value: statusCounts.IN_PROGRESS || 0, color: "#f97316" },
    { label: "Resolved",    value: statusCounts.RESOLVED || 0, color: "#22c55e" },
    { label: "Closed",      value: statusCounts.CLOSED   || 0, color: "#6b7280" },
    { label: "Rejected",    value: statusCounts.REJECTED || 0, color: "#ef4444" },
    { label: "Critical",    value: priorityCounts.CRITICAL || 0, color: "#ef4444" },
    { label: "High",        value: priorityCounts.HIGH   || 0, color: "#f97316" },
  ];

  if (accessDenied) {
    return (
      <div className={`tkt-root ${embedded ? "tkt-embedded" : "tkt-page"}`}>
        <div className="tkt-container">
          <div className="tkt-empty">
            <div className="tkt-empty-icon">!</div>
            <h3>Admin access required</h3>
            <p>Your current session is not allowed to open the incident assignment desk.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`tkt-root ${embedded ? "tkt-embedded" : "tkt-page"}`}>
      <div className="tkt-container">

        {/* Header */}
        <div className="tkt-header">
          <div className="tkt-header-left">
            <span className="tkt-header-badge">Incident Desk</span>
            <h1>Campus Incidents</h1>
            <p>Review submitted support requests and assign registered technicians.</p>
          </div>
          <button className="tkt-btn-secondary" onClick={loadAll}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="tkt-stats-row">
          {statCards.map(s => (
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
                placeholder="Search ID, title, description, location or requester..."
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

          {/* Category + Technician + footer */}
          <div className="tkt-filter-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="tkt-filter-label" style={{ width: "auto" }}>Category</span>
                <select className="tkt-select" value={categoryFilter} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="tkt-filter-label" style={{ width: "auto" }}>Technician</span>
                <select className="tkt-select" value={techFilter} onChange={e => setTechFilter(e.target.value)}>
                  <option value="ALL">All Technicians</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {hasActiveFilters && (
                <button className="tkt-clear-btn" onClick={clearFilters}>✕ Clear filters</button>
              )}
              <span className="tkt-result-count">
                Showing <strong>{filtered.length}</strong> of {allTickets.length} ticket{allTickets.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="tkt-content-scroll">
          {/* Cards */}
          {loading ? (
            <div className="tkt-spinner" />
          ) : filtered.length === 0 ? (
            <div className="tkt-empty">
              <div className="tkt-empty-icon">📋</div>
              <h3>No tickets found</h3>
              <p>{hasActiveFilters ? "Try adjusting or clearing your filters" : "No tickets have been submitted yet."}</p>
              {hasActiveFilters && (
                <button className="tkt-btn-secondary" style={{ marginTop: 14 }} onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="tkt-cards-grid">
              {filtered.map(t => (
                <div key={t.id} className="tkt-card-shell">
                  <TicketCard
                    ticket={t}
                    onClick={() => setSelected(t)}
                    adminControls
                    technicians={technicians}
                    onAssign={handleQuickAssign}
                  />
                  <button
                    className="tkt-btn-danger"
                    style={{ position: "absolute", top: 10, right: 10, padding: "4px 10px", fontSize: "0.7rem", zIndex: 2 }}
                    onClick={e => { e.stopPropagation(); handleDelete(t.id); }}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelected(null)}
          onUpdated={updated => {
            const patch = prev => prev.map(t => t.id === updated.id ? updated : t);
            setAllTickets(patch); setApiTickets(patch);
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}
