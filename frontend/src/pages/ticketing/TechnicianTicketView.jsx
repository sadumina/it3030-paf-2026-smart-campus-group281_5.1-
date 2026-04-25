import { useEffect, useMemo, useRef, useState } from "react";
import "../../components/ticketing/ticketing.css";
import { RefreshCw, Search, SlidersHorizontal } from "lucide-react";

import TicketCard from "../../components/ticketing/TicketCard";
import TicketDetailModal from "../../components/ticketing/TicketDetailModal";
import { getAuth } from "../../services/authStorage";
import { fetchTickets } from "../../services/ticketService";

const STATUSES = [
  { key: "ALL", label: "All", cls: "s-all" },
  { key: "OPEN", label: "Open", cls: "s-open" },
  { key: "IN_PROGRESS", label: "In Progress", cls: "s-progress" },
  { key: "RESOLVED", label: "Resolved", cls: "s-resolved" },
];

const PRIORITIES = [
  { key: "ALL", label: "All", cls: "p-all" },
  { key: "CRITICAL", label: "Critical", cls: "p-critical" },
  { key: "HIGH", label: "High", cls: "p-high" },
  { key: "MEDIUM", label: "Medium", cls: "p-medium" },
  { key: "LOW", label: "Low", cls: "p-low" },
];

const CATEGORIES = ["ALL", "ELECTRICAL", "PLUMBING", "IT", "HVAC", "STRUCTURAL", "CLEANING", "OTHER"];

export default function TechnicianTicketView({ embedded = false, onTicketsChange }) {
  const auth = getAuth();
  const [allTickets, setAllTickets] = useState([]);
  const [apiTickets, setApiTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatus] = useState("ALL");
  const [priorityFilter, setPriority] = useState("ALL");
  const [categoryFilter, setCategory] = useState("ALL");
  const [selectedTicket, setSelected] = useState(null);
  const initialized = useRef(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets();
      setAllTickets(data);
      setApiTickets(data);
      onTicketsChange?.(data);
    } catch {
      setAllTickets([]);
      setApiTickets([]);
      onTicketsChange?.([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    let active = true;
    setLoading(true);
    fetchTickets({ status: statusFilter, priority: priorityFilter, category: categoryFilter })
      .then((data) => {
        if (active) {
          setApiTickets(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [statusFilter, priorityFilter, categoryFilter]);

  const statusCounts = useMemo(
    () => ({
      ALL: allTickets.length,
      OPEN: allTickets.filter((ticket) => ticket.status === "OPEN").length,
      IN_PROGRESS: allTickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
      RESOLVED: allTickets.filter((ticket) => ticket.status === "RESOLVED").length,
    }),
    [allTickets],
  );

  const priorityCounts = useMemo(
    () => ({
      ALL: allTickets.length,
      CRITICAL: allTickets.filter((ticket) => ticket.priority === "CRITICAL").length,
      HIGH: allTickets.filter((ticket) => ticket.priority === "HIGH").length,
      MEDIUM: allTickets.filter((ticket) => ticket.priority === "MEDIUM").length,
      LOW: allTickets.filter((ticket) => ticket.priority === "LOW").length,
    }),
    [allTickets],
  );

  const filtered = useMemo(() => {
    if (!keyword.trim()) {
      return apiTickets;
    }

    const query = keyword.toLowerCase();
    return apiTickets.filter(
      (ticket) =>
        ticket.ticketId?.toLowerCase().includes(query) ||
        ticket.title?.toLowerCase().includes(query) ||
        ticket.location?.toLowerCase().includes(query) ||
        ticket.createdByName?.toLowerCase().includes(query),
    );
  }, [apiTickets, keyword]);

  const hasActiveFilters =
    statusFilter !== "ALL" || priorityFilter !== "ALL" || categoryFilter !== "ALL" || keyword.trim();

  const clearFilters = () => {
    setStatus("ALL");
    setPriority("ALL");
    setCategory("ALL");
    setKeyword("");
  };

  return (
    <div className={embedded ? "tkt-root tkt-embedded tkt-technician-board" : "tkt-page tkt-root"}>
      <div className="tkt-container">
        <div className="tkt-header">
          <div className="tkt-header-left">
            <span className="tkt-header-badge">Module C - Technician Workload</span>
            <h1>My Assigned Tickets</h1>
            <p>Start assigned work, update field comments, and resolve incidents with notes, {auth?.name}.</p>
          </div>
          <button className="tkt-btn-secondary" onClick={loadTickets} type="button">
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="tkt-stats-row">
          {[
            { label: "Assigned", value: allTickets.length, color: "#f97316" },
            { label: "Open", value: statusCounts.OPEN, color: "#2563eb" },
            { label: "In Progress", value: statusCounts.IN_PROGRESS, color: "#f97316" },
            { label: "Resolved", value: statusCounts.RESOLVED, color: "#16a34a" },
          ].map((stat) => (
            <div key={stat.label} className="tkt-stat-card">
              <div className="tkt-stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="tkt-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="tkt-filter-section">
          <div className="tkt-filter-row">
            <span className="tkt-filter-label">Search</span>
            <div className="tkt-search-wrap" style={{ flex: 1 }}>
              <Search size={16} />
              <input
                className="tkt-search"
                placeholder="Search by ID, title, location, or requester..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
          </div>

          <div className="tkt-filter-row">
            <span className="tkt-filter-label">Status</span>
            <div className="tkt-status-tabs">
              {STATUSES.map((status) => (
                <button
                  key={status.key}
                  className={`tkt-status-tab ${status.cls} ${statusFilter === status.key ? "active" : ""}`}
                  onClick={() => setStatus(status.key)}
                  type="button"
                >
                  {status.label}
                  <span className="tkt-tab-count">{statusCounts[status.key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="tkt-filter-row">
            <span className="tkt-filter-label">Priority</span>
            <div className="tkt-priority-pills">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority.key}
                  className={`tkt-priority-pill ${priority.cls} ${priorityFilter === priority.key ? "active" : ""}`}
                  onClick={() => setPriority(priority.key)}
                  type="button"
                >
                  {priority.label}
                  {priority.key !== "ALL" ? (
                    <span style={{ opacity: 0.65, fontSize: "0.68rem" }}>
                      ({priorityCounts[priority.key] ?? 0})
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="tkt-filter-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="tkt-filter-label" style={{ width: "auto" }}>
                Category
              </span>
              <select className="tkt-select" value={categoryFilter} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category === "ALL" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {hasActiveFilters ? (
                <button className="tkt-clear-btn" onClick={clearFilters} type="button">
                  <SlidersHorizontal size={13} />
                  Clear filters
                </button>
              ) : null}
              <span className="tkt-result-count">
                Showing <strong>{filtered.length}</strong> of {allTickets.length} ticket
                {allTickets.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="tkt-content-scroll">
          {loading ? (
            <div className="tkt-spinner" />
          ) : filtered.length === 0 ? (
            <div className="tkt-empty">
              <div className="tkt-empty-icon">0</div>
              <h3>{hasActiveFilters ? "No matching tickets" : "No tickets assigned"}</h3>
              <p>
                {hasActiveFilters
                  ? "Try adjusting or clearing your filters."
                  : "You have no assigned tickets right now."}
              </p>
              {hasActiveFilters ? (
                <button className="tkt-btn-secondary" style={{ marginTop: 14 }} onClick={clearFilters} type="button">
                  Clear Filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="tkt-cards-grid">
              {filtered.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onClick={() => setSelected(ticket)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTicket ? (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setAllTickets((current) => current.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
            setApiTickets((current) => current.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
            setSelected(updated);
          }}
        />
      ) : null}
    </div>
  );
}
