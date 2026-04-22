import { useState, useEffect, useRef, useCallback } from "react";

// SLA limits in milliseconds keyed by priority
const SLA_LIMITS = {
  CRITICAL: 1 * 60 * 60 * 1000,         // 1 hour
  HIGH:     4 * 60 * 60 * 1000,         // 4 hours
  MEDIUM:   24 * 60 * 60 * 1000,        // 24 hours
  LOW:      72 * 60 * 60 * 1000,        // 72 hours
};

function formatDuration(ms) {
  if (ms < 0) {
    const abs = Math.abs(ms);
    const h = Math.floor(abs / 3600000);
    const m = Math.floor((abs % 3600000) / 60000);
    const s = Math.floor((abs % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m overdue`;
    if (m > 0) return `${m}m ${s}s overdue`;
    return `${s}s overdue`;
  }
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m remaining`;
  if (m > 0) return `${m}m ${s}s remaining`;
  return `${s}s remaining`;
}

export default function SlaTimer({ createdAt, priority, resolvedAt, compact = false }) {
  const slaLimit = SLA_LIMITS[priority] || SLA_LIMITS.MEDIUM;
  const startTime = new Date(createdAt).getTime();
  const endTime = resolvedAt ? new Date(resolvedAt).getTime() : null;

  const calcRemaining = useCallback(() => {
    const now = endTime || Date.now();
    return slaLimit - (now - startTime);
  }, [slaLimit, startTime, endTime]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    if (endTime) return; // ticket already resolved — static
    const id = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(id);
  }, [calcRemaining, endTime]);

  const isOverdue = remaining < 0;
  const pct = Math.min(100, Math.max(0, ((slaLimit - remaining) / slaLimit) * 100));

  let cls = "ok";
  if (isOverdue) cls = "overdue";
  else if (pct > 75) cls = "warning";

  if (compact) {
    return (
      <span className={`tkt-sla ${cls}`}>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        {isOverdue ? "⚠ OVERDUE" : formatDuration(remaining)}
      </span>
    );
  }

  return (
    <div className={`tkt-sla ${cls}`} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <span style={{ fontSize: "0.75rem" }}>{isOverdue ? "⚠ SLA BREACHED" : formatDuration(remaining)}</span>
      </div>
      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: isOverdue ? "#fca5a5" : pct > 75 ? "#fde047" : "#86efac",
          borderRadius: 4,
          transition: "width 1s linear",
        }} />
      </div>
    </div>
  );
}
