import SlaTimer from "./SlaTimer";

const PRIORITY_ICON = {
  CRITICAL: "🔴",
  HIGH:     "🟠",
  MEDIUM:   "🟡",
  LOW:      "🟢",
};

const CATEGORY_ICON = {
  ELECTRICAL: "⚡",
  PLUMBING:   "🔧",
  IT:         "💻",
  HVAC:       "❄️",
  STRUCTURAL: "🏗️",
  CLEANING:   "🧹",
  OTHER:      "📋",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function TicketCard({
  ticket,
  onClick,
  adminControls,
  technicians,
  onAssign,
  showDelete,
  deleting,
  onDelete,
}) {
  const isActive = ["OPEN", "IN_PROGRESS"].includes(ticket.status);

  return (
    <article
      className={`tkt-card priority-${ticket.priority} tkt-fade`}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="tkt-card-top">
        <div>
          <span className="tkt-card-id">{ticket.ticketId}</span>
          <h3 className="tkt-card-title">{ticket.title}</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span className={`tkt-badge tkt-badge-card status-${ticket.status}`}>
            {ticket.status.replace("_", " ")}
          </span>
          <span className={`tkt-badge tkt-badge-card priority-${ticket.priority}`}>
            {PRIORITY_ICON[ticket.priority]} {ticket.priority}
          </span>
          {ticket.priorityEscalated && (
            <span className="tkt-badge-escalated">
              ↑ AUTO-ESCALATED
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="tkt-card-desc">{ticket.description}</p>

      {/* Meta row */}
      <div className="tkt-card-meta">
        {ticket.category && (
          <span className="tkt-badge tkt-badge-card category">
            {CATEGORY_ICON[ticket.category] || "📋"} {ticket.category}
          </span>
        )}
        {ticket.location && (
          <span className="tkt-card-meta-item">
            📍 {ticket.location}
          </span>
        )}
        {ticket.assignedTechnicianName && (
          <span className="tkt-card-meta-item">
            👤 {ticket.assignedTechnicianName}
          </span>
        )}
      </div>

      {/* SLA breached banner */}
      {isActive && ticket.slaBreachedNotified && (
        <div className="tkt-sla-banner">
          ⚠ SLA BREACHED — Response overdue
        </div>
      )}

      {/* SLA Timer — only for active tickets */}
      {isActive && (
        <div className="tkt-sla-wrapper" style={{ marginTop: 8 }}>
          <SlaTimer
            createdAt={ticket.createdAt}
            priority={ticket.priority}
            resolvedAt={ticket.resolvedAt}
            compact={false}
          />
        </div>
      )}

      {/* Footer */}
      <div className="tkt-card-footer">
        <span>📅 {formatDate(ticket.createdAt)}</span>
        <span>
          By {ticket.createdByName}
        </span>
      </div>

      {showDelete && (
        <div className="tkt-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="tkt-card-delete-btn"
            onClick={() => onDelete?.(ticket)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Ticket"}
          </button>
        </div>
      )}

      {/* Admin: Quick assign inline */}
      {adminControls && technicians?.length > 0 && ticket.status === "OPEN" && (
        <div className="tkt-assign-row" onClick={(e) => e.stopPropagation()}>
          <select
            className="tkt-assign-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onAssign?.(ticket.id, e.target.value);
            }}
          >
            <option value="" disabled>⚡ Assign Technician</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <span className="tkt-assign-label">Quick assign</span>
        </div>
      )}
    </article>
  );
}
