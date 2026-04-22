import { useState } from "react";
import { X } from "lucide-react";

export default function StatusChangeModal({ isOpen, resource, onClose, onStatusChange, loading }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      setError("Please select a status");
      return;
    }

    if (selectedStatus === resource?.status) {
      setError("Please select a different status");
      return;
    }

    setError("");
    await onStatusChange(resource?.id, selectedStatus, reason);
  };

  const handleClose = () => {
    setSelectedStatus("");
    setReason("");
    setError("");
    onClose();
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-[2rem] bg-white shadow-lg shadow-[#a1452b]/25 border border-white/20 w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Change Resource Status</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 hover:bg-slate-100 transition"
            disabled={loading}
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Resource Info */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-slate-900">{resource?.name}</p>
          <p className="text-xs text-slate-600 mt-1">Current status: {resource?.status === "ACTIVE" ? "Active" : "Out of Service"}</p>
        </div>

        {/* Error Message */}
        {error && <p className="text-sm font-medium text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Dropdown */}
          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-semibold text-slate-700">
              New Status *
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setError("");
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15"
            >
              <option value="">Select status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status} disabled={status === resource?.status}>
                  {status === "ACTIVE" ? "Active" : "Out of Service"}
                  {status === resource?.status ? " (Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Reason (Optional) */}
          <div>
            <label htmlFor="reason" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Reason (Optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Scheduled maintenance, Equipment repair..."
              rows="3"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">For admin records only - not shown to users</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-[#a1452b] text-white font-semibold py-3 shadow-lg shadow-[#a1452b]/25 transition hover:bg-[#873922] disabled:opacity-70"
            >
              {loading ? "Updating..." : "Change Status"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-slate-200 bg-white text-slate-900 font-semibold py-3 transition hover:bg-slate-50 disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
