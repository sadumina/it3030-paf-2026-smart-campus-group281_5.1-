import { useState, useCallback, useRef } from "react";
import { createTicket, uploadTicketImages } from "../../services/ticketService";

const CATEGORIES = ["ELECTRICAL", "PLUMBING", "IT", "HVAC", "STRUCTURAL", "CLEANING", "OTHER"];

// Auto-suggest priority based on category
const PRIORITY_SUGGESTION = {
  ELECTRICAL: "HIGH",
  PLUMBING:   "HIGH",
  IT:         "MEDIUM",
  HVAC:       "MEDIUM",
  STRUCTURAL: "CRITICAL",
  CLEANING:   "LOW",
  OTHER:      "MEDIUM",
};

const CATEGORY_ICON = {
  ELECTRICAL: "⚡", PLUMBING: "🔧", IT: "💻",
  HVAC: "❄️", STRUCTURAL: "🏗️", CLEANING: "🧹", OTHER: "📋",
};

export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "OTHER", priority: "MEDIUM",
  });
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // data URLs
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef();

  const handleField = (key, val) => {
    const update = { ...form, [key]: val };
    if (key === "category") update.priority = PRIORITY_SUGGESTION[val] || "MEDIUM";
    setForm(update);
  };

  const addFiles = useCallback((files) => {
    const toAdd = Array.from(files).slice(0, 3 - images.length);
    if (!toAdd.length) return;
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setPreviews((prev) => [...prev, e.target.result].slice(0, 3));
      reader.readAsDataURL(f);
    });
    setImages((prev) => [...prev, ...toAdd].slice(0, 3));
  }, [images]);

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }

    setLoading(true); setError("");
    try {
      const ticket = await createTicket(form);
      if (images.length > 0) {
        await uploadTicketImages(ticket.id, images);
      }
      onCreated?.(ticket);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tkt-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tkt-modal">
        {/* Header */}
        <div className="tkt-modal-header">
          <h2>🎫 Create New Ticket</h2>
          <button className="tkt-close-btn" onClick={onClose}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="tkt-modal-body">
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                color: "#fca5a5", fontSize: "0.82rem"
              }}>⚠ {error}</div>
            )}

            {/* Title */}
            <div className="tkt-form-group">
              <label className="tkt-form-label">Issue Title *</label>
              <input
                className="tkt-form-input"
                placeholder="e.g. Broken AC in Room 204"
                value={form.title}
                onChange={(e) => handleField("title", e.target.value)}
                maxLength={120}
              />
            </div>

            {/* Description */}
            <div className="tkt-form-group">
              <label className="tkt-form-label">Description *</label>
              <textarea
                className="tkt-form-textarea"
                placeholder="Describe the issue in detail — location, severity, when it started..."
                value={form.description}
                onChange={(e) => handleField("description", e.target.value)}
                rows={4}
              />
            </div>

            {/* Category + Priority Row */}
            <div className="tkt-form-row">
              <div className="tkt-form-group" style={{ margin: 0 }}>
                <label className="tkt-form-label">Category</label>
                <select
                  className="tkt-form-select"
                  value={form.category}
                  onChange={(e) => handleField("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_ICON[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div className="tkt-form-group" style={{ margin: 0 }}>
                <label className="tkt-form-label">
                  Priority
                  <span style={{ color: "#f97316", fontSize: "0.65rem", marginLeft: 6 }}>
                    (auto-suggested)
                  </span>
                </label>
                <select
                  className="tkt-form-select"
                  value={form.priority}
                  onChange={(e) => handleField("priority", e.target.value)}
                >
                  <option value="CRITICAL">🔴 CRITICAL</option>
                  <option value="HIGH">🟠 HIGH</option>
                  <option value="MEDIUM">🟡 MEDIUM</option>
                  <option value="LOW">🟢 LOW</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="tkt-form-group">
              <label className="tkt-form-label">
                Attachments
                <span style={{ color: "#71717a", fontWeight: 400, marginLeft: 6 }}>
                  (up to 3 images)
                </span>
              </label>

              {images.length < 3 && (
                <div
                  className={`tkt-upload-zone ${dragging ? "drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInput.current?.click()}
                >
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"
                    stroke="#f97316" strokeWidth={1.5} style={{ margin: "0 auto", display: "block" }}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p>Click or drag & drop images here</p>
                  <p style={{ fontSize: "0.73rem", color: "#71717a" }}>
                    {3 - images.length} slot{3 - images.length !== 1 ? "s" : ""} remaining • JPG, PNG, WEBP
                  </p>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </div>
              )}

              {previews.length > 0 && (
                <div className="tkt-image-previews">
                  {previews.map((src, idx) => (
                    <div key={idx} className="tkt-image-thumb">
                      <img src={src} alt={`Preview ${idx + 1}`} />
                      <button
                        type="button"
                        className="tkt-image-thumb-remove"
                        onClick={() => removeImage(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="tkt-modal-footer">
            <button type="button" className="tkt-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tkt-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                    borderRadius: "50%", animation: "tkt-spin 0.7s linear infinite" }} />
                  Submitting…
                </>
              ) : "🎫 Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
