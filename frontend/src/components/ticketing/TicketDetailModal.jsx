import { useState, useEffect } from "react";
import {
  fetchComments, addComment, editComment, deleteComment,
  assignTechnician, updateTicketStatus, fetchTechnicians,
  deleteTicketImage,
} from "../../services/ticketService";
import { getAuth } from "../../services/authStorage";
import TicketTimeline from "./TicketTimeline";
import ImagePreviewModal from "./ImagePreviewModal";
import SlaTimer from "./SlaTimer";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const PRIORITY_ICON = { CRITICAL: "🔴", HIGH: "🟠", MEDIUM: "🟡", LOW: "🟢" };

export default function TicketDetailModal({ ticket: initialTicket, onClose, onUpdated }) {
  const auth = getAuth();
  const role = auth?.role?.toUpperCase();
  const userId = auth?.id;

  const [ticket, setTicket] = useState(initialTicket);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCid, setEditingCid] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadComments();
    if (role === "ADMIN") {
      fetchTechnicians().then(setTechnicians).catch(() => {});
    }
  }, [ticket.id]);

  const loadComments = async () => {
    try {
      const data = await fetchComments(ticket.id);
      setComments(data);
    } catch { /* ignore */ }
  };

  // ─── Actions ──────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!selectedTech) return;
    setLoading(true); setError("");
    try {
      const updated = await assignTechnician(ticket.id, selectedTech);
      setTicket(updated);
      onUpdated?.(updated);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === "RESOLVED" && !statusNote.trim()) {
      setError("Resolution note is required before marking as resolved.");
      return;
    }
    if (newStatus === "REJECTED" && !rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setLoading(true); setError("");
    try {
      const updated = await updateTicketStatus(ticket.id, {
        status: newStatus,
        resolutionNote: statusNote,
        rejectionReason,
      });
      setTicket(updated);
      onUpdated?.(updated);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await addComment(ticket.id, newComment);
      setNewComment("");
      loadComments();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleEditComment = async (cid) => {
    if (!editContent.trim()) return;
    try {
      await editComment(ticket.id, cid, editContent);
      setEditingCid(null);
      loadComments();
    } catch (e) { setError(e.message); }
  };

  const handleDeleteComment = async (cid) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(ticket.id, cid);
      loadComments();
    } catch (e) { setError(e.message); }
  };

  const handleDeleteImage = async (url) => {
    if (!window.confirm("Remove this image?")) return;
    const filename = url.split("/").pop();
    try {
      const updated = await deleteTicketImage(ticket.id, filename);
      setTicket(updated);
      onUpdated?.(updated);
    } catch (e) { setError(e.message); }
  };

  const isActive = ["OPEN", "IN_PROGRESS"].includes(ticket.status);
  const canDeleteImages = role === "ADMIN" || userId === ticket.createdByUserId;

  return (
    <>
      <div className="tkt-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="tkt-modal tkt-modal-wide">
          {/* Header */}
          <div className="tkt-modal-header">
            <div>
              <span style={{ fontSize: "0.7rem", color: "#f97316", fontWeight: 600, letterSpacing: "0.1em" }}>
                {ticket.ticketId}
              </span>
              <h2 style={{ marginTop: 4 }}>{ticket.title}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`tkt-badge status-${ticket.status}`}>
                {ticket.status.replace("_", " ")}
              </span>
              <span className={`tkt-badge priority-${ticket.priority}`}>
                {PRIORITY_ICON[ticket.priority]} {ticket.priority}
              </span>
              <button className="tkt-close-btn" onClick={onClose}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ padding: "0 26px" }}>
            <div className="tkt-tabs">
              {["details", "timeline", "comments"].map((tab) => (
                <button
                  key={tab}
                  className={`tkt-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "details" ? "📋 Details" : tab === "timeline" ? "⏱ Timeline" : `💬 Comments (${comments.length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="tkt-modal-body" style={{ maxHeight: "62vh", overflowY: "auto" }}>
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 14,
                color: "#fca5a5", fontSize: "0.82rem"
              }}>⚠ {error}</div>
            )}

            {/* ─── DETAILS TAB ─── */}
            {activeTab === "details" && (
              <>
                {/* SLA Timer */}
                {isActive && (
                  <div style={{ marginBottom: 14 }}>
                    {ticket.slaBreachedNotified && (
                      <div style={{
                        padding: "6px 12px", marginBottom: 8,
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.35)",
                        borderRadius: 8, color: "#fca5a5",
                        fontSize: "0.78rem", fontWeight: 600,
                      }}>
                        ⚠ SLA BREACHED — Admin and ticket owner have been notified
                      </div>
                    )}
                    <SlaTimer createdAt={ticket.createdAt} priority={ticket.priority} resolvedAt={ticket.resolvedAt} />
                  </div>
                )}

                {/* Description */}
                <div className="tkt-form-group">
                  <label className="tkt-form-label">Description</label>
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, padding: "12px 14px", fontSize: "0.88rem",
                    color: "#d4d4d8", lineHeight: 1.6,
                  }}>
                    {ticket.description}
                  </div>
                </div>

                {/* Meta grid */}
                <div className="tkt-detail-grid">
                  <div className="tkt-detail-field">
                    <label>Category</label>
                    <span className={`tkt-badge category`}>{ticket.category}</span>
                  </div>
                  {ticket.location && (
                    <div className="tkt-detail-field">
                      <label>📍 Location</label>
                      <span>{ticket.location}</span>
                    </div>
                  )}
                  {ticket.contactDetails && (
                    <div className="tkt-detail-field">
                      <label>📞 Contact</label>
                      <span>{ticket.contactDetails}</span>
                    </div>
                  )}
                  <div className="tkt-detail-field">
                    <label>Created By</label>
                    <span>{ticket.createdByName}</span>
                  </div>
                  <div className="tkt-detail-field">
                    <label>Created At</label>
                    <span>{formatDateTime(ticket.createdAt)}</span>
                  </div>
                  <div className="tkt-detail-field">
                    <label>Last Updated</label>
                    <span>{formatDateTime(ticket.updatedAt)}</span>
                  </div>
                  {ticket.assignedTechnicianName && (
                    <div className="tkt-detail-field">
                      <label>Assigned Technician</label>
                      <span>{ticket.assignedTechnicianName}</span>
                    </div>
                  )}
                  {ticket.resolvedAt && (
                    <div className="tkt-detail-field">
                      <label>Resolved At</label>
                      <span>{formatDateTime(ticket.resolvedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Resolution / Rejection notes */}
                {ticket.resolutionNote && (
                  <div className="tkt-info-box resolve">
                    <label>Resolution Note</label>
                    {ticket.resolutionNote}
                  </div>
                )}
                {ticket.rejectionReason && (
                  <div className="tkt-info-box reject">
                    <label>Rejection Reason</label>
                    {ticket.rejectionReason}
                  </div>
                )}

                {/* Images */}
                {ticket.imageUrls?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <p className="tkt-section-heading">📎 Attachments</p>
                    <div className="tkt-image-gallery">
                      {ticket.imageUrls.map((url, i) => (
                        <div key={i} className="tkt-gallery-item" style={{ position: "relative" }}>
                          <img
                            src={`http://localhost:8080${url}`}
                            alt={`Attachment ${i + 1}`}
                            onClick={() => setLightboxSrc(url)}
                          />
                          {canDeleteImages && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteImage(url); }}
                              style={{
                                position: "absolute", top: 4, right: 4,
                                background: "rgba(0,0,0,0.65)", color: "#fff",
                                border: "none", borderRadius: "50%",
                                width: 22, height: 22, fontSize: "0.7rem",
                                cursor: "pointer", lineHeight: 1, display: "flex",
                                alignItems: "center", justifyContent: "center",
                              }}
                              title="Remove image"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── ADMIN ACTIONS ─── */}
                {role === "ADMIN" && (
                  <div style={{ marginTop: 22, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 18 }}>
                    <p className="tkt-section-heading">⚙ Admin Controls</p>

                    {/* Assign technician */}
                    {ticket.status !== "CLOSED" && ticket.status !== "REJECTED" && (
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                        <select
                          className="tkt-form-select"
                          value={selectedTech}
                          onChange={(e) => setSelectedTech(e.target.value)}
                          style={{ flex: 1 }}
                        >
                          <option value="">— Select Technician —</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <button className="tkt-btn-primary" onClick={handleAssign} disabled={!selectedTech || loading}>
                          Assign
                        </button>
                      </div>
                    )}

                    {/* Status controls */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {ticket.status === "OPEN" && (
                        <button className="tkt-btn-secondary" onClick={() => handleStatusChange("IN_PROGRESS")}>
                          ▶ Start Progress
                        </button>
                      )}
                      {ticket.status === "RESOLVED" && (
                        <button className="tkt-btn-primary" onClick={() => handleStatusChange("CLOSED")}>
                          ✓ Close Ticket
                        </button>
                      )}
                      {["OPEN", "IN_PROGRESS"].includes(ticket.status) && (
                        <button className="tkt-btn-danger" onClick={() => handleStatusChange("REJECTED")}>
                          ✕ Reject Ticket
                        </button>
                      )}
                    </div>

                    {/* Rejection reason */}
                    {["OPEN", "IN_PROGRESS"].includes(ticket.status) && (
                      <div className="tkt-form-group" style={{ marginBottom: 0 }}>
                        <label className="tkt-form-label">Rejection Reason (if rejecting)</label>
                        <input
                          className="tkt-form-input"
                          placeholder="Reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TECHNICIAN ACTIONS ─── */}
                {role === "TECHNICIAN" && ticket.assignedTechnicianId === userId && (
                  <div style={{ marginTop: 22, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 18 }}>
                    <p className="tkt-section-heading">🔧 Technician Actions</p>
                    <div className="tkt-form-group">
                      <label className="tkt-form-label">Resolution Note *</label>
                      <textarea
                        className="tkt-form-textarea"
                        placeholder="Describe how you resolved the issue..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    {ticket.status === "IN_PROGRESS" && (
                      <button
                        className="tkt-btn-primary"
                        onClick={() => handleStatusChange("RESOLVED")}
                        disabled={loading}
                      >
                        ✓ Mark as Resolved
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ─── TIMELINE TAB ─── */}
            {activeTab === "timeline" && (
              <TicketTimeline events={ticket.timeline || []} />
            )}

            {/* ─── COMMENTS TAB ─── */}
            {activeTab === "comments" && (
              <div className="tkt-comments-section">
                <h4>Discussion</h4>
                {comments.length === 0 && (
                  <p style={{ color: "#71717a", fontSize: "0.82rem" }}>No comments yet. Start the conversation.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="tkt-comment">
                    <div className="tkt-comment-avatar">
                      {(c.authorName || "?")[0].toUpperCase()}
                    </div>
                    <div className="tkt-comment-bubble">
                      <div className="tkt-comment-meta">
                        <span className="tkt-comment-author">{c.authorName}</span>
                        <span className={`tkt-badge role-${c.authorRole}`} style={{ fontSize: "0.6rem", padding: "1px 6px" }}>
                          {c.authorRole}
                        </span>
                        {c.edited && <span style={{ fontSize: "0.65rem", color: "#71717a" }}>(edited)</span>}
                        <span className="tkt-comment-time">
                          {new Date(c.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {editingCid === c.id ? (
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <input
                            className="tkt-comment-input"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            autoFocus
                          />
                          <button className="tkt-btn-primary" style={{ padding: "6px 12px" }} onClick={() => handleEditComment(c.id)}>Save</button>
                          <button className="tkt-btn-secondary" style={{ padding: "6px 10px" }} onClick={() => setEditingCid(null)}>✕</button>
                        </div>
                      ) : (
                        <p className="tkt-comment-text">{c.content}</p>
                      )}
                      {(c.authorId === userId || role === "ADMIN") && editingCid !== c.id && (
                        <div className="tkt-comment-actions">
                          {c.authorId === userId && (
                            <button className="tkt-btn-ghost" onClick={() => { setEditingCid(c.id); setEditContent(c.content); }}>
                              Edit
                            </button>
                          )}
                          <button className="tkt-btn-ghost" style={{ color: "#ef4444" }} onClick={() => handleDeleteComment(c.id)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add comment */}
                <div className="tkt-comment-add">
                  <input
                    className="tkt-comment-input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                  />
                  <button className="tkt-btn-primary" onClick={handleAddComment} disabled={!newComment.trim() || loading}>
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="tkt-modal-footer">
            <button className="tkt-btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSrc && <ImagePreviewModal src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </>
  );
}
