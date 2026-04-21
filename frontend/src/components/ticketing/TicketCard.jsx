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

export default function TicketCard({ ticket, onClick, adminControls, technicians, onAssign }) {
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
          <span className={`tkt-badge status-${ticket.status}`}>
            {ticket.status.replace("_", " ")}
          </span>
          <span className={`tkt-badge priority-${ticket.priority}`}>
            {PRIORITY_ICON[ticket.priority]} {ticket.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="tkt-card-desc">{ticket.description}</p>

      {/* Meta row */}
      <div className="tkt-card-meta">
        {ticket.category && (
          <span className="tkt-badge category">
            {CATEGORY_ICON[ticket.category] || "📋"} {ticket.category}
          </span>
        )}
        {ticket.location && (
          <span style={{ fontSize: "0.74rem", color: "#a1a1aa" }}>
            📍 {ticket.location}
          </span>
        )}
        {ticket.assignedTechnicianName && (
          <span style={{ fontSize: "0.74rem", color: "#86efac" }}>
            👤 {ticket.assignedTechnicianName}
          </span>
        )}
      </div>

      {/* SLA breached banner */}
      {isActive && ticket.slaBreachedNotified && (
        <div style={{
          marginTop: 10,
          padding: "4px 10px",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.35)",
          borderRadius: 6,
          color: "#fca5a5",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}>
          ⚠ SLA BREACHED — Response overdue
        </div>
      )}

      {/* SLA Timer — only for active tickets */}
      {isActive && (
        <div style={{ marginTop: 8 }}>
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
        <span style={{ color: "#a78bfa", fontSize: "0.72rem" }}>
          By {ticket.createdByName}
        </span>
      </div>

      {/* Admin: Quick assign inline */}
      {adminControls && technicians?.length > 0 && ticket.status === "OPEN" && (
        <div className="tkt-assign-row" onClick={(e) => e.stopPropagation()}>
          <select
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
          <span style={{ fontSize: "0.7rem", color: "#71717a" }}>Quick assign</span>
        </div>
      )}
    </article>
  );
}
