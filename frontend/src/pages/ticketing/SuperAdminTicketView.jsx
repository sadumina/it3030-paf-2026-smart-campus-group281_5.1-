import { useState, useEffect, useMemo, useRef } from "react";
import {
  fetchTickets, fetchStats, fetchTechnicians,
  assignTechnician, deleteTicket,
} from "../../services/ticketService";
import { fetchAllUsers, updateUserRole, removeUser } from "../../services/adminUserService";
import TicketCard from "../../components/ticketing/TicketCard";
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
const ALL_ROLES   = ["USER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN"];

function roleBadgeStyle(role) {
  switch ((role || "").toUpperCase()) {
    case "SUPER_ADMIN": return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" };
    case "ADMIN":       return { background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" };
    case "TECHNICIAN":  return { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" };
    default:            return { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
  }
}

export default function SuperAdminTicketView({ embedded = false }) {
  const [activeTab, setActiveTab] = useState("tickets");

  // ── Ticket state ──────────────────────────────────────────────────────────
  const [allTickets, setAllTickets]   = useState([]);
  const [apiTickets, setApiTickets]   = useState([]);
  const [stats, setStats]             = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelected] = useState(null);
  const [keyword, setKeyword]         = useState("");
  const [statusFilter, setStatus]     = useState("ALL");
  const [priorityFilter, setPriority] = useState("ALL");
  const [categoryFilter, setCategory] = useState("ALL");
  const [techFilter, setTechFilter]   = useState("ALL");
  const initialized = useRef(false);

  // ── User state ────────────────────────────────────────────────────────────
  const [users, setUsers]             = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleDrafts, setRoleDrafts]   = useState({});
  const [userMsg, setUserMsg]         = useState("");
  const [userError, setUserError]     = useState("");
  const [userTab, setUserTab]         = useState("standard");

  // ── Ticket loaders ─────────────────────────────────────────────────────────
  const loadAll = async () => {
    setTicketsLoading(true);
    try {
      const [t, s, techs] = await Promise.all([
        fetchTickets(), fetchStats(), fetchTechnicians(),
      ]);
      setAllTickets(t); setApiTickets(t); setStats(s); setTechnicians(techs);
    } catch { /* ignore */ }
    finally { setTicketsLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return; }
    let active = true;
    setTicketsLoading(true);
    fetchTickets({ status: statusFilter, priority: priorityFilter, category: categoryFilter })
      .then(data => { if (active) setApiTickets(data); })
      .catch(() => {})
      .finally(() => { if (active) setTicketsLoading(false); });
    return () => { active = false; };
  }, [statusFilter, priorityFilter, categoryFilter]);

  // ── User loader ───────────────────────────────────────────────────────────
  const loadUsers = async () => {
    setUsersLoading(true);
    setUserError("");
    try {
      const data = await fetchAllUsers();
      setUsers(data);
      setRoleDrafts(data.reduce((acc, u) => {
        acc[u.id] = (u.role || "USER").toUpperCase();
        return acc;
      }, {}));
    } catch (e) {
      setUserError(e.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users" && users.length === 0) loadUsers();
  }, [activeTab]);

  // ── Computed ──────────────────────────────────────────────────────────────
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

  const ticketCountByUser = useMemo(() => {
    const map = {};
    allTickets.forEach(t => { map[t.createdByUserId] = (map[t.createdByUserId] || 0) + 1; });
    return map;
  }, [allTickets]);

  const standardUsers   = useMemo(() => users.filter(u => !["ADMIN","SUPER_ADMIN"].includes((u.role||"").toUpperCase())), [users]);
  const privilegedUsers = useMemo(() => users.filter(u => ["ADMIN","SUPER_ADMIN"].includes((u.role||"").toUpperCase())), [users]);
  const displayedUsers  = userTab === "privileged" ? privilegedUsers : standardUsers;

  // ── Ticket actions ─────────────────────────────────────────────────────────
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

  // ── User actions ──────────────────────────────────────────────────────────
  const handleRoleApply = async (userId) => {
    setUserMsg(""); setUserError("");
    try {
      await updateUserRole(userId, roleDrafts[userId] || "USER");
      await loadUsers();
      setUserMsg("Role updated successfully.");
      setTimeout(() => setUserMsg(""), 3000);
    } catch (e) { setUserError(e.message || "Failed to update role"); }
  };

  const handleRemoveUser = async (userId, name) => {
    if (!window.confirm(`Remove user "${name}"? This cannot be undone.`)) return;
    setUserError("");
    try {
      await removeUser(userId);
      await loadUsers();
    } catch (e) { setUserError(e.message || "Failed to remove user"); }
  };

  const statCards = [
    { label: "Total",       value: stats.total      || 0, color: "#f97316" },
    { label: "Open",        value: stats.open        || 0, color: "#3b82f6" },
    { label: "In Progress", value: stats.inProgress  || 0, color: "#f97316" },
    { label: "Resolved",    value: stats.resolved    || 0, color: "#22c55e" },
    { label: "Closed",      value: stats.closed      || 0, color: "#6b7280" },
    { label: "Rejected",    value: stats.rejected    || 0, color: "#ef4444" },
    { label: "Critical",    value: stats.critical    || 0, color: "#ef4444" },
    { label: "High",        value: stats.high        || 0, color: "#f97316" },
  ];

  return (
    <div className={`tkt-root ${embedded ? "tkt-embedded" : "tkt-page"}`}>
      <div className="tkt-container">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="tkt-header">
          <div className="tkt-header-left">
            <span className="tkt-header-badge">Module C — Super Admin Command</span>
            <h1>👑 Global Ticket &amp; User Control</h1>
            <p>Oversee all campus tickets and manage every user account</p>
          </div>
          <button className="tkt-btn-secondary" onClick={loadAll}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="tkt-stats-row">
          {statCards.map(s => (
            <div key={s.label} className="tkt-stat-card">
              <div className="tkt-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="tkt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tab switcher ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "2px solid var(--tkt-border)" }}>
          <button
            className={`tkt-status-tab s-all ${activeTab === "tickets" ? "active" : ""}`}
            style={{ borderRadius: "6px 6px 0 0", marginBottom: -2 }}
            onClick={() => setActiveTab("tickets")}
          >
            📋 All Tickets
            <span className="tkt-tab-count">{allTickets.length}</span>
          </button>
          <button
            className={`tkt-status-tab s-progress ${activeTab === "users" ? "active" : ""}`}
            style={{ borderRadius: "6px 6px 0 0", marginBottom: -2 }}
            onClick={() => setActiveTab("users")}
          >
            👥 User Directory
            <span className="tkt-tab-count">{users.length || "—"}</span>
          </button>
        </div>

        {/* ══════════════ TICKETS TAB ══════════════════════════════════════ */}
        {activeTab === "tickets" && (
          <>
            <div className="tkt-filter-section">

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

              <div className="tkt-filter-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="tkt-filter-label" style={{ width: "auto" }}>Category</span>
                    <select className="tkt-select" value={categoryFilter} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="tkt-filter-label" style={{ width: "auto" }}>Technician</span>
                    <select className="tkt-select" value={techFilter} onChange={e => setTechFilter(e.target.value)}>
                      <option value="ALL">All Technicians</option>
                      {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
              {ticketsLoading ? (
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
          </>
        )}

        {/* ══════════════ USER DIRECTORY TAB ═══════════════════════════════ */}
        {activeTab === "users" && (
          <div className="tkt-content-scroll">

            {/* Sub-tab row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className={`tkt-status-tab s-all ${userTab === "standard" ? "active" : ""}`}
                  onClick={() => setUserTab("standard")}
                >
                  Users &amp; Technicians
                  <span className="tkt-tab-count">{standardUsers.length}</span>
                </button>
                <button
                  className={`tkt-status-tab s-critical ${userTab === "privileged" ? "active" : ""}`}
                  onClick={() => setUserTab("privileged")}
                >
                  Admins &amp; Super Admins
                  <span className="tkt-tab-count">{privilegedUsers.length}</span>
                </button>
              </div>
              <button className="tkt-btn-secondary" onClick={loadUsers} style={{ padding: "6px 14px", fontSize: "0.75rem" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Feedback banners */}
            {userMsg && (
              <div style={{ marginBottom: 10, padding: "8px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: "0.8rem", color: "#166534" }}>
                ✓ {userMsg}
              </div>
            )}
            {userError && (
              <div style={{ marginBottom: 10, padding: "8px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: "0.8rem", color: "#991b1b" }}>
                ✕ {userError}
              </div>
            )}

            {usersLoading ? (
              <div className="tkt-spinner" />
            ) : (
              <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--tkt-border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ background: "var(--tkt-bg-alt)", borderBottom: "1px solid var(--tkt-border)" }}>
                      {["Name", "Email", "Current Role", "Tickets", "Assign Role", "Action"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--tkt-muted)", textTransform: "uppercase", fontSize: "0.67rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsers.map(u => {
                      const selectedRole  = roleDrafts[u.id] || (u.role || "USER").toUpperCase();
                      const ticketCount   = ticketCountByUser[u.id] || 0;
                      const badge         = roleBadgeStyle(u.role);
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid var(--tkt-border)", transition: "background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "var(--tkt-bg-alt)"}
                          onMouseLeave={e => e.currentTarget.style.background = ""}
                        >
                          <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--tkt-text)", whiteSpace: "nowrap" }}>
                            {u.name || "—"}
                          </td>
                          <td style={{ padding: "10px 14px", color: "var(--tkt-muted)", fontSize: "0.76rem" }}>
                            {u.email || "—"}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ ...badge, display: "inline-block", borderRadius: 99, padding: "3px 10px", fontWeight: 600, fontSize: "0.72rem" }}>
                              {(u.role || "USER").toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            <span style={{
                              display: "inline-block", minWidth: 28, textAlign: "center",
                              background: ticketCount > 0 ? "#fff7ed" : "var(--tkt-bg-alt)",
                              color: ticketCount > 0 ? "#c2410c" : "var(--tkt-muted)",
                              border: `1px solid ${ticketCount > 0 ? "#fed7aa" : "var(--tkt-border)"}`,
                              borderRadius: 99, padding: "2px 8px", fontWeight: 700, fontSize: "0.75rem",
                            }}>
                              {ticketCount}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <select
                                className="tkt-select"
                                value={selectedRole}
                                style={{ fontSize: "0.75rem" }}
                                onChange={e => setRoleDrafts(prev => ({ ...prev, [u.id]: e.target.value }))}
                              >
                                {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <button
                                className="tkt-btn-primary"
                                style={{ padding: "4px 10px", fontSize: "0.72rem", whiteSpace: "nowrap" }}
                                onClick={() => handleRoleApply(u.id)}
                              >
                                Apply
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <button
                              className="tkt-btn-danger"
                              style={{ padding: "4px 12px", fontSize: "0.72rem", whiteSpace: "nowrap" }}
                              onClick={() => handleRemoveUser(u.id, u.name || "this user")}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!displayedUsers.length && (
                      <tr>
                        <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "var(--tkt-muted)", fontSize: "0.85rem" }}>
                          No users found in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
