import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Save, Trash2 } from "lucide-react";
import { createResource, updateResource } from "../../../services/resourceService";

const RESOURCE_TYPES = ["Lecture Hall", "Lab", "Meeting Room", "Equipment", "Study Space"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptyForm = {
  name: "",
  type: "",
  capacity: "",
  location: "",
  description: "",
  status: "ACTIVE",
  availabilityWindows: [],
  isTemporarilyUnavailable: false,
};

function getInitialForm(resource) {
  if (!resource) {
    return emptyForm;
  }

  const windows = Array.isArray(resource.availabilityWindows) ? resource.availabilityWindows : [];
  return {
    name: resource.name || "",
    type: resource.type || "",
    capacity: resource.capacity || "",
    location: resource.location || "",
    description: resource.description || "",
    status: resource.status || "ACTIVE",
    availabilityWindows: windows,
    isTemporarilyUnavailable: windows.length === 0,
  };
}

export default function ResourceFormModal({ isOpen, resource = null, onClose, onSaved }) {
  const isEditMode = Boolean(resource?.id);
  const [form, setForm] = useState(() => getInitialForm(resource));
  const [newWindow, setNewWindow] = useState({ day: "", startTime: "", endTime: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm(resource));
      setNewWindow({ day: "", startTime: "", endTime: "" });
      setFieldErrors({});
      setError("");
      setSaving(false);
    }
  }, [isOpen, resource]);

  if (!isOpen) {
    return null;
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: "" }));
    }
  }

  function handleTemporaryToggle(event) {
    const checked = event.target.checked;
    setForm((current) => ({
      ...current,
      isTemporarilyUnavailable: checked,
      availabilityWindows: checked ? [] : current.availabilityWindows,
    }));
  }

  function addAvailabilityWindow() {
    if (!newWindow.day || !newWindow.startTime || !newWindow.endTime) {
      setError("Choose a day, start time, and end time.");
      return;
    }

    if (newWindow.startTime >= newWindow.endTime) {
      setError("End time must be after start time.");
      return;
    }

    const windowLabel = `${newWindow.day}: ${newWindow.startTime} - ${newWindow.endTime}`;
    setForm((current) => ({
      ...current,
      availabilityWindows: [...current.availabilityWindows, windowLabel],
      isTemporarilyUnavailable: false,
    }));
    setNewWindow({ day: "", startTime: "", endTime: "" });
    setError("");
    setFieldErrors((current) => ({ ...current, availability: "" }));
  }

  function removeAvailabilityWindow(indexToRemove) {
    setForm((current) => ({
      ...current,
      availabilityWindows: current.availabilityWindows.filter((_, index) => index !== indexToRemove),
    }));
  }

  function validateForm() {
    const errors = {};
    const capacity = Number(form.capacity);

    if (!form.name.trim()) {
      errors.name = "Resource name is required.";
    }
    if (!form.type) {
      errors.type = "Choose a resource type.";
    }
    if (!form.location.trim()) {
      errors.location = "Location is required.";
    }
    if (!capacity || capacity <= 0) {
      errors.capacity = "Capacity must be greater than 0.";
    } else if (capacity > 80) {
      errors.capacity = "Capacity cannot exceed 80.";
    }
    if (!form.isTemporarilyUnavailable && form.availabilityWindows.length === 0) {
      errors.availability = "Add at least one availability window or mark it unavailable.";
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      type: form.type,
      capacity: Number(form.capacity),
      location: form.location.trim(),
      description: form.description.trim(),
      status: form.status,
      availabilityWindows: form.isTemporarilyUnavailable ? [] : form.availabilityWindows,
    };

    try {
      const saved = isEditMode
        ? await updateResource(resource.id, payload)
        : await createResource(payload);
      onSaved?.(saved, { isEditMode });
      onClose?.();
    } catch (requestError) {
      setError(requestError.message || "Unable to save resource.");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
              {isEditMode ? "Edit Resource" : "New Resource"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {isEditMode ? form.name || "Update resource" : "Create campus resource"}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Add the details admins and users need to find, manage, and book this resource.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Close resource form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-96px)] overflow-y-auto px-5 py-5">
          {error ? (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Resource Name</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Innovation Lab A"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:bg-slate-950 dark:text-slate-100 ${
                  fieldErrors.name ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
                }`}
              />
              {fieldErrors.name ? <span className="text-xs text-rose-600">{fieldErrors.name}</span> : null}
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Type</span>
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:bg-slate-950 dark:text-slate-100 ${
                  fieldErrors.type ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <option value="">Select type</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {fieldErrors.type ? <span className="text-xs text-rose-600">{fieldErrors.type}</span> : null}
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Capacity</span>
              <input
                name="capacity"
                type="number"
                min="1"
                max="80"
                value={form.capacity}
                onChange={handleFormChange}
                placeholder="40"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:bg-slate-950 dark:text-slate-100 ${
                  fieldErrors.capacity ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
                }`}
              />
              {fieldErrors.capacity ? <span className="text-xs text-rose-600">{fieldErrors.capacity}</span> : null}
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Location</span>
              <input
                name="location"
                type="text"
                value={form.location}
                onChange={handleFormChange}
                placeholder="Engineering Block - Room 201"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:bg-slate-950 dark:text-slate-100 ${
                  fieldErrors.location ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
                }`}
              />
              {fieldErrors.location ? <span className="text-xs text-rose-600">{fieldErrors.location}</span> : null}
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={4}
                placeholder="Describe the resource, equipment, access notes, or constraints."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "ACTIVE" ? "Active" : "Out of Service"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Availability Windows</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Add the normal booking hours or mark the resource unavailable.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                <input
                  type="checkbox"
                  checked={form.isTemporarilyUnavailable}
                  onChange={handleTemporaryToggle}
                  className="h-4 w-4 rounded border-amber-300 text-orange-600 focus:ring-orange-500"
                />
                Temporarily unavailable
              </label>
            </div>

            {!form.isTemporarilyUnavailable ? (
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_130px_130px_auto]">
                <select
                  value={newWindow.day}
                  onChange={(event) => setNewWindow((current) => ({ ...current, day: event.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">Day</option>
                  {DAYS.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newWindow.startTime}
                  onChange={(event) => setNewWindow((current) => ({ ...current, startTime: event.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  type="time"
                  value={newWindow.endTime}
                  onChange={(event) => setNewWindow((current) => ({ ...current, endTime: event.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={addAvailabilityWindow}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            ) : null}

            {fieldErrors.availability ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.availability}</p>
            ) : null}

            {form.availabilityWindows.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {form.availabilityWindows.map((windowLabel, index) => (
                  <span
                    key={`${windowLabel}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    {windowLabel}
                    <button
                      type="button"
                      onClick={() => removeAvailabilityWindow(index)}
                      className="rounded-full p-0.5 text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                      aria-label={`Remove ${windowLabel}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <div className="sticky bottom-0 -mx-5 mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : isEditMode ? "Update Resource" : "Create Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
