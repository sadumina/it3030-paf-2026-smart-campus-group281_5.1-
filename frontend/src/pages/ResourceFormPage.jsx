import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createResource, updateResource, fetchResourceById } from "../services/resourceService";
import { getRole } from "../services/authStorage";

export default function ResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    description: "",
    status: "ACTIVE",
    availabilityWindows: [],
  });

  const [newWindow, setNewWindow] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [pageLoading, setPageLoading] = useState(isEditMode);

  const RESOURCE_TYPES = ["Lecture Hall", "Lab", "Meeting Room", "Equipment", "Study Space"];
  const STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Check admin role
  useEffect(() => {
    if (getRole() !== "ADMIN") {
      navigate("/");
    }
  }, [navigate]);

  // Load resource if editing
  useEffect(() => {
    if (isEditMode) {
      const loadResource = async () => {
        try {
          const resource = await fetchResourceById(id);
          if (resource) {
            setForm({
              name: resource.name || "",
              type: resource.type || "",
              capacity: resource.capacity || "",
              location: resource.location || "",
              description: resource.description || "",
              status: resource.status || "ACTIVE",
              availabilityWindows: resource.availabilityWindows || [],
            });
          }
        } catch (err) {
          setError("Failed to load resource");
        } finally {
          setPageLoading(false);
        }
      };
      loadResource();
    }
  }, [id, isEditMode]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleNewWindowChange = (e) => {
    const { name, value } = e.target;
    setNewWindow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAvailabilityWindow = () => {
    if (!newWindow.day || !newWindow.startTime || !newWindow.endTime) {
      setError("Please fill all availability window fields");
      return;
    }

    if (newWindow.startTime >= newWindow.endTime) {
      setError("End time must be after start time");
      return;
    }

    const windowStr = `${newWindow.day}: ${newWindow.startTime} - ${newWindow.endTime}`;
    setForm((prev) => ({
      ...prev,
      availabilityWindows: [...prev.availabilityWindows, windowStr],
    }));

    setNewWindow({
      day: "",
      startTime: "",
      endTime: "",
    });
    setError("");
  };

  const removeAvailabilityWindow = (index) => {
    setForm((prev) => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Resource name is required";
    }

    if (!form.type) {
      errors.type = "Resource type is required";
    }

    if (!form.capacity || form.capacity <= 0) {
      errors.capacity = "Capacity must be greater than 0";
    } else if (form.capacity > 80) {
      errors.capacity = "Capacity cannot exceed 80";
    }

    if (!form.location.trim()) {
      errors.location = "Location is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        capacity: parseInt(form.capacity),
        location: form.location.trim(),
        description: form.description.trim(),
        status: form.status,
        availabilityWindows: form.availabilityWindows,
      };

      if (isEditMode) {
        await updateResource(id, payload);
        setMessage("Resource updated successfully!");
      } else {
        await createResource(payload);
        setMessage("Resource created successfully!");
      }

      setTimeout(() => {
        navigate("/admin/resources");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to save resource");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f4ee] to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[2rem] bg-white backdrop-blur-xl shadow-lg shadow-[#a1452b]/25 border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isEditMode ? "Edit Resource" : "Create New Resource"}
          </h1>
          <p className="text-sm text-slate-600 mb-8">
            {isEditMode ? "Update resource details" : "Add a new resource to the campus system"}
          </p>

          {error && <p className="text-sm font-medium text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}
          {message && <p className="text-sm font-medium text-emerald-600 mb-4 p-3 bg-emerald-50 rounded-lg">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Resource Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g., Innovation Lab A"
                className={`w-full rounded-2xl border ${
                  fieldErrors.name ? "border-red-500" : "border-slate-200"
                } bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15`}
              />
              {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Resource Type *
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleFormChange}
                className={`w-full rounded-2xl border ${
                  fieldErrors.type ? "border-red-500" : "border-slate-200"
                } bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15`}
              >
                <option value="">Select type</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {fieldErrors.type && <p className="text-xs text-red-600 mt-1">{fieldErrors.type}</p>}
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Capacity * (Max: 80)
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                max="80"
                value={form.capacity}
                onChange={handleFormChange}
                placeholder="e.g., 40"
                className={`w-full rounded-2xl border ${
                  fieldErrors.capacity ? "border-red-500" : "border-slate-200"
                } bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15`}
              />
              {fieldErrors.capacity && <p className="text-xs text-red-600 mt-1">{fieldErrors.capacity}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleFormChange}
                placeholder="e.g., Engineering Block - Room 201"
                className={`w-full rounded-2xl border ${
                  fieldErrors.location ? "border-red-500" : "border-slate-200"
                } bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15`}
              />
              {fieldErrors.location && <p className="text-xs text-red-600 mt-1">{fieldErrors.location}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Describe the resource and its features..."
                rows="4"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15 resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "ACTIVE" ? "Active" : "Out of Service"}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Windows */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Availability Windows</label>

              {/* Add Window Form */}
              <div className="bg-slate-50 p-4 rounded-2xl mb-4 space-y-3">
                <div>
                  <label htmlFor="day" className="block text-xs font-medium text-slate-700 mb-1">
                    Day
                  </label>
                  <select
                    id="day"
                    name="day"
                    value={newWindow.day}
                    onChange={handleNewWindowChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-2 focus:ring-[#a1452b]/15"
                  >
                    <option value="">Select day</option>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startTime" className="block text-xs font-medium text-slate-700 mb-1">
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={newWindow.startTime}
                      onChange={handleNewWindowChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-2 focus:ring-[#a1452b]/15"
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-xs font-medium text-slate-700 mb-1">
                      End Time
                    </label>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={newWindow.endTime}
                      onChange={handleNewWindowChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-2 focus:ring-[#a1452b]/15"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addAvailabilityWindow}
                  className="w-full rounded-lg bg-[#a1452b] text-white font-medium py-2 text-sm transition hover:bg-[#873922] disabled:opacity-70"
                >
                  Add Window
                </button>
              </div>

              {/* Display Windows */}
              {form.availabilityWindows.length > 0 && (
                <div className="space-y-2">
                  {form.availabilityWindows.map((window, index) => (
                    <div key={index} className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <span className="text-sm text-slate-700">{window}</span>
                      <button
                        type="button"
                        onClick={() => removeAvailabilityWindow(index)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-[#a1452b] text-white font-semibold py-3 shadow-lg shadow-[#a1452b]/25 transition hover:bg-[#873922] disabled:opacity-70"
              >
                {loading ? "Saving..." : isEditMode ? "Update Resource" : "Create Resource"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/resources")}
                disabled={loading}
                className="flex-1 rounded-2xl border border-slate-200 bg-white text-slate-900 font-semibold py-3 transition hover:bg-slate-50 disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
