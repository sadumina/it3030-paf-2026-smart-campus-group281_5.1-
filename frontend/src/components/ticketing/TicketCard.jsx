import {
  CalendarDays,
  CircleAlert,
  ClipboardList,
  Laptop,
  MapPin,
  Paintbrush,
  Snowflake,
  UserRound,
  Wrench,
  Zap,
} from "lucide-react";
import SlaTimer from "./SlaTimer";

const CATEGORY_ICON = {
  ELECTRICAL: Zap,
  PLUMBING: Wrench,
  IT: Laptop,
  HVAC: Snowflake,
  STRUCTURAL: CircleAlert,
  CLEANING: Paintbrush,
  OTHER: ClipboardList,
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
  const CategoryIcon = CATEGORY_ICON[ticket.category] || ClipboardList;

  return (
    <article
      className={`tkt-card priority-${ticket.priority} tkt-fade`}
      onClick={onClick}
    >
      <div className="tkt-card-top">
        <div>
          <span className="tkt-card-id">{ticket.ticketId}</span>
          <h3 className="tkt-card-title">{ticket.title}</h3>
        </div>
        <div className="tkt-card-badges">
          <span className={`tkt-badge tkt-badge-card status-${ticket.status}`}>
            {ticket.status.replace("_", " ")}
          </span>
          <span className={`tkt-badge tkt-badge-card priority-${ticket.priority}`}>
            <span className="tkt-priority-dot" aria-hidden="true" />
            {ticket.priority}
          </span>
          {ticket.priorityEscalated && (
            <span className="tkt-badge-escalated">Auto-escalated</span>
          )}
        </div>
      </div>

      <p className="tkt-card-desc">{ticket.description}</p>

      <div className="tkt-card-meta">
        {ticket.category && (
          <span className="tkt-badge tkt-badge-card category">
            <CategoryIcon size={13} strokeWidth={2.2} />
            {ticket.category}
          </span>
        )}
        {ticket.location && (
          <span className="tkt-card-meta-item">
            <MapPin size={13} strokeWidth={2.2} />
            {ticket.location}
          </span>
        )}
        {ticket.assignedTechnicianName && (
          <span className="tkt-card-meta-item">
            <UserRound size={13} strokeWidth={2.2} />
            {ticket.assignedTechnicianName}
          </span>
        )}
      </div>

      {isActive && ticket.slaBreachedNotified && (
        <div className="tkt-sla-banner">SLA breached - response overdue</div>
      )}

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

      <div className="tkt-card-footer">
        <span>
          <CalendarDays size={13} strokeWidth={2.2} />
          {formatDate(ticket.createdAt)}
        </span>
        <span>By {ticket.createdByName}</span>
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

      {adminControls && technicians?.length > 0 && ticket.status === "OPEN" && (
        <div className="tkt-assign-row" onClick={(e) => e.stopPropagation()}>
          <select
            className="tkt-assign-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onAssign?.(ticket.id, e.target.value);
            }}
          >
            <option value="" disabled>
              Assign technician
            </option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
          <span className="tkt-assign-label">Quick assign</span>
        </div>
      )}
    </article>
  );
}
