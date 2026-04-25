function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const EVENT_ICONS = {
  CREATED:        { icon: "✦", label: "Created" },
  ASSIGNED:       { icon: "👤", label: "Assigned" },
  STATUS_CHANGED: { icon: "↻",  label: "Status Updated" },
  RESOLVED:       { icon: "✓",  label: "Resolved" },
  CLOSED:         { icon: "✕",  label: "Closed" },
  REJECTED:       { icon: "✕",  label: "Rejected" },
  COMMENT_ADDED:  { icon: "💬", label: "Comment" },
};

export default function TicketTimeline({ events = [] }) {
  if (!events.length) {
    return (
      <p style={{ fontSize: "0.82rem", color: "#71717a", textAlign: "center", padding: "16px 0" }}>
        No timeline events yet.
      </p>
    );
  }

  return (
    <div className="tkt-timeline">
      {events.map((ev, idx) => {
        const meta = EVENT_ICONS[ev.eventType] || { icon: "•", label: ev.eventType };
        return (
          <div key={idx} className="tkt-timeline-item">
            <div className={`tkt-timeline-dot event-${ev.eventType}`} />
            <div className="tkt-timeline-content">
              <div className="tkt-timeline-meta">
                <span className="tkt-timeline-actor">
                  {meta.icon} {ev.performedByName || "System"}
                  {ev.performedByRole && (
                    <span
                      className={`tkt-badge role-${ev.performedByRole}`}
                      style={{ marginLeft: 6, fontSize: "0.62rem", padding: "1px 6px" }}
                    >
                      {ev.performedByRole}
                    </span>
                  )}
                </span>
                <span className="tkt-timeline-time">{formatTime(ev.timestamp)}</span>
              </div>
              <p className="tkt-timeline-desc">{ev.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
