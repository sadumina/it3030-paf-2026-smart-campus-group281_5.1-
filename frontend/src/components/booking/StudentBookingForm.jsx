import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking, getAllBookings, getResources, getResourceCapacity } from "../../services/bookingService";
import { getAuth } from "../../services/authStorage";

// Type strings returned by the Resource API
const TYPE_LABELS = {
  "Lecture Hall": "Lecture Halls",
  "Lab": "Labs",
  "Meeting Room": "Meeting Rooms",
  "Equipment": "Equipment",
};

function StepIndicator({ step }) {
  const steps = ["Resource", "Date & Time", "Details", "Review"];

  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {steps.map((label, index) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ease-out ${
                index + 1 < step
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-100 ring-2 ring-emerald-100 dark:ring-emerald-900"
                  : index + 1 === step
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/40 scale-110 ring-4 ring-orange-100 dark:ring-orange-900/40"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 scale-95 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {index + 1 < step ? (
                <svg
                  className="h-5 w-5 animate-[pulse_2s_ease-in-out_infinite]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`mt-3 text-[11px] uppercase tracking-widest font-bold transition-colors duration-300 ${
                index + 1 === step
                  ? "text-orange-600 dark:text-orange-400"
                  : index + 1 < step
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="mx-1 sm:mx-2 mb-6 h-1 w-8 sm:w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-in-out ${index + 1 < step ? "w-full bg-emerald-600" : "w-0 bg-emerald-500"}`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function StudentBookingForm({
  embedded = false,
  initialUserId = "",
  onSuccess,
  onClose,
}) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const accountUserId = initialUserId || getAuth()?.id || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("forward");

  // Live resources from the API
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState("");

  // Capacity info: { available: number, unlimited: boolean } | null
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [capacityLoading, setCapacityLoading] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    resourceId: "",
    userId: accountUserId,
    studentId: "",
    date: today,
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1,
  });

  // Fetch resources on mount
  useEffect(() => {
    setResourcesLoading(true);
    getResources()
      .then((res) => setResources(res.data || []))
      .catch(() => setResourcesError("Could not load resources. Please refresh."))
      .finally(() => setResourcesLoading(false));
  }, []);

  // Fetch capacity whenever step 3 becomes active (resource + time must be selected)
  useEffect(() => {
    if (step !== 3 || !form.resourceId || !form.date || !form.startTime || !form.endTime) {
      setCapacityInfo(null);
      return;
    }
    const startISO = `${form.date}T${form.startTime}:00`;
    const endISO = `${form.date}T${form.endTime}:00`;
    setCapacityLoading(true);
    getResourceCapacity(form.resourceId, startISO, endISO)
      .then((res) => setCapacityInfo(res.data))
      .catch(() => setCapacityInfo(null))
      .finally(() => setCapacityLoading(false));
  }, [step, form.resourceId, form.date, form.startTime, form.endTime]);

  // Derive unique category types from live data
  const categories = useMemo(() => {
    const types = [...new Set(resources.map((r) => r.type).filter(Boolean))];
    return types.sort();
  }, [resources]);

  // Resources filtered by selected category
  const filteredResources = useMemo(() => {
    if (!form.categoryId) return [];
    return resources.filter((r) => r.type === form.categoryId);
  }, [resources, form.categoryId]);

  // Selected resource object (for review screen)
  const selectedResource = useMemo(
    () => resources.find((r) => r.id === form.resourceId) || null,
    [resources, form.resourceId],
  );

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
    if (event.target.name === "categoryId") {
      setForm((prev) => ({ ...prev, resourceId: "" }));
    }
  };

  const hasOverlappingTimeRange = async () => {
    if (!form.resourceId || !form.date || !form.startTime || !form.endTime) {
      return false;
    }

    const requestedStart = new Date(`${form.date}T${form.startTime}:00`);
    const requestedEnd = new Date(`${form.date}T${form.endTime}:00`);

    try {
      const response = await getAllBookings();
      const bookings = response?.data || [];

      return bookings.some((booking) => {
        if (booking.resourceId !== form.resourceId) {
          return false;
        }

        const existingStart = new Date(booking.startTime);
        const existingEnd = new Date(booking.endTime);

        if (
          Number.isNaN(existingStart.getTime()) ||
          Number.isNaN(existingEnd.getTime())
        ) {
          return false;
        }

        return existingStart <= requestedEnd && existingEnd >= requestedStart;
      });
    } catch {
      return false;
    }
  };

  const validateStep = async () => {
    if (step === 1) {
      if (!form.categoryId) {
        setError("Please select a resource category.");
        return false;
      }
      if (!form.resourceId) {
        setError("Please select a resource.");
        return false;
      }
    }
    if (step === 2) {
      if (!form.startTime || !form.endTime) {
        setError("Please select both start and end times.");
        return false;
      }
      const now = new Date();
      const selectedStart = new Date(`${form.date}T${form.startTime}`);
      if (selectedStart < now) {
        setError("Start time cannot be in the past.");
        return false;
      }
      if (form.startTime >= form.endTime) {
        setError("End time must be after start time.");
        return false;
      }

      const overlaps = await hasOverlappingTimeRange();
      if (overlaps) {
        setError(
          "This time range is already booked. Please choose another time slot.",
        );
        return false;
      }
    }
    if (step === 3) {
      if (!form.studentId.trim()) {
        setError("Please enter your Student ID.");
        return false;
      }
      if (!form.purpose.trim()) {
        setError("Please describe the purpose of your booking.");
        return false;
      }
      // Capacity check
      if (
        capacityInfo &&
        !capacityInfo.unlimited &&
        Number(form.expectedAttendees) > capacityInfo.available
      ) {
        setError(
          `Not enough capacity. Only ${capacityInfo.available} spot(s) remaining for this time slot.`,
        );
        return false;
      }
    }
    return true;
  };

  const next = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setDirection("forward");
      setAnimating(true);
      setTimeout(() => {
        setStep((current) => current + 1);
        setAnimating(false);
      }, 300);
    }
  };

  const back = () => {
    setDirection("backward");
    setAnimating(true);
    setTimeout(() => {
      setStep((current) => current - 1);
      setAnimating(false);
    }, 300);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const bookingData = {
        resourceId: form.resourceId,
        userId: accountUserId,
        studentId: form.studentId,
        startTime: `${form.date}T${form.startTime}:00`,
        endTime: `${form.date}T${form.endTime}:00`,
        purpose: form.purpose,
        expectedAttendees: Number(form.expectedAttendees) || 1,
      };
      await createBooking(bookingData);
      if (embedded && onSuccess) {
        onSuccess();
        return;
      }
      setSuccess(true);
    } catch (requestError) {
      const backendMessage =
        requestError.response?.data?.message ||
        requestError.response?.data ||
        "";

      if (
        typeof backendMessage === "string" &&
        backendMessage.toLowerCase().includes("time slot already booked")
      ) {
        setStep(2);
        setDirection("backward");
        setError(
          "This time range is already booked. Please choose another time slot.",
        );
        return;
      }

      setError(backendMessage || "Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Use the live resource name instead of a hardcoded lookup
  const resourceLabel = selectedResource?.name || form.resourceId || "—";

  if (success) {
    return (
      <div
        className={`${embedded ? "py-10" : "flex min-h-[90vh] items-center justify-center p-6"}`}
      >
        <div
          className={`w-full max-w-md mx-auto text-center animate-[scaleIn_0.5s_ease-out_forwards] ${embedded ? "" : "rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl dark:border-slate-700 dark:bg-slate-900"}`}
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 shadow-xl shadow-emerald-500/30">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Booking Submitted!
          </h2>
          <p className="mb-2 text-slate-600 dark:text-slate-300">
            Your request for{" "}
            <strong className="text-orange-600 dark:text-orange-400">
              {resourceLabel}
            </strong>{" "}
            has been submitted.
          </p>
          <div className="mx-auto my-6 inline-flex max-w-max items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 shadow-sm dark:border-amber-500/30 dark:bg-amber-900/30 dark:text-amber-300">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span>
              Status: <strong>PENDING</strong> Review
            </span>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setSuccess(false);
                setStep(1);
                setForm({
                  categoryId: "",
                  resourceId: "",
                  userId: accountUserId,
                  studentId: "",
                  date: today,
                  startTime: "",
                  endTime: "",
                  purpose: "",
                  expectedAttendees: 1,
                });
              }}
              className="flex-1 rounded-xl border-2 border-slate-200 py-3.5 font-bold text-slate-600 transition-all duration-200 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-lg dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              New Booking
            </button>
            {embedded ? (
              <button
                onClick={() => onClose?.()}
                className="flex-1 rounded-xl bg-slate-900 py-3.5 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl dark:bg-orange-600 dark:hover:bg-orange-500"
              >
                Close
              </button>
            ) : (
              <button
                onClick={() => navigate("/dashboard/bookings")}
                className="flex-1 rounded-xl bg-slate-900 py-3.5 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl dark:bg-orange-600 dark:hover:bg-orange-500"
              >
                Back to Bookings
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const animationClass = animating
    ? direction === "forward"
      ? "opacity-0 -translate-x-10 scale-95"
      : "opacity-0 translate-x-10 scale-95"
    : "opacity-100 translate-x-0 scale-100";

  return (
    <div
      className={`${embedded ? "" : "flex min-h-screen pt-10 sm:pt-0 sm:items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden"}`}
    >
      {!embedded && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        </>
      )}

      <div className={`w-full ${embedded ? "" : "max-w-2xl relative z-10"}`}>
        {!embedded && (
          <div className="mb-8 text-center animate-[slideDown_0.5s_ease-out]">
            <button
              onClick={() => navigate("/dashboard/bookings")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-1 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-sm"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-orange-600 dark:text-orange-400 pb-2">
              New Booking Request
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Follow the simple steps below to reserve a facility or equipment
              for your next activity.
            </p>
          </div>
        )}

        <div
          className={`transition-all duration-300 ${embedded ? "" : "rounded-[2rem] border border-slate-200/60 bg-white/80 backdrop-blur-xl p-6 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:border-slate-700/60 dark:bg-slate-900/80"}`}
        >
          <div className={embedded ? "p-2 sm:p-4" : ""}>
            <StepIndicator step={step} />

            {error && (
              <div className="mb-6 animate-[shake_0.5s_ease-in-out] flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm dark:border-rose-500/30 dark:bg-rose-900/20 dark:text-rose-300">
                <div className="bg-rose-100 p-1.5 rounded-full dark:bg-rose-800/50">
                  <svg
                    className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="relative min-h-[350px] flex flex-col justify-start overflow-hidden">
              <div
                className={`w-full transition-all duration-300 transform ease-in-out ${animationClass}`}
              >
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        What do you need?
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                        Select a category, then pick an available resource.
                      </p>
                    </div>

                    {/* Loading / error state */}
                    {resourcesLoading && (
                      <div className="space-y-3 animate-pulse">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-9 flex-1 rounded-full bg-slate-100 dark:bg-slate-800" />
                          ))}
                        </div>
                        <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                        <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                      </div>
                    )}

                    {resourcesError && !resourcesLoading && (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                        {resourcesError}
                      </p>
                    )}

                    {!resourcesLoading && !resourcesError && (
                      <>
                        {/* Category tab pills */}
                        <div className="flex flex-wrap gap-2">
                          {categories.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  categoryId: type,
                                  resourceId: "",
                                }))
                              }
                              className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                                form.categoryId === type
                                  ? "border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-500/20"
                                  : "border-slate-200 bg-white/60 text-slate-600 hover:border-orange-400 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-500"
                              }`}
                            >
                              {TYPE_LABELS[type] || type}
                            </button>
                          ))}
                        </div>

                        {/* Resource cards */}
                        {form.categoryId && (
                          <div className="space-y-2 animate-[slideDown_0.3s_ease-out]">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                              {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} available
                            </p>

                            {filteredResources.length === 0 && (
                              <p className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                No resources found in this category.
                              </p>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                              {filteredResources.map((resource, idx) => {
                                const isActive =
                                  resource.status === "ACTIVE" ||
                                  resource.availability === "Available";
                                const isSelected = form.resourceId === resource.id;

                                return (
                                  <label
                                    key={resource.id}
                                    className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition-all duration-300 ${
                                      !isActive
                                        ? "cursor-not-allowed border-slate-100 bg-slate-50/50 opacity-60 dark:border-slate-700/50 dark:bg-slate-800/30"
                                        : isSelected
                                          ? "border-orange-600 bg-orange-50 shadow-lg shadow-orange-500/10 scale-[1.01] dark:border-orange-500 dark:bg-orange-900/30"
                                          : "border-slate-200 bg-white hover:border-orange-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-orange-500/40"
                                    }`}
                                    style={{ animationDelay: `${idx * 0.06}s` }}
                                  >
                                    {/* Radio indicator */}
                                    <div
                                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                        !isActive
                                          ? "border-slate-200 bg-slate-50 dark:border-slate-700"
                                          : isSelected
                                            ? "border-orange-600 bg-white"
                                            : "border-slate-300 bg-white group-hover:border-orange-500 dark:border-slate-600 dark:bg-slate-800"
                                      }`}
                                    >
                                      {isSelected && isActive && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-orange-600 animate-[scaleIn_0.2s_ease-out]" />
                                      )}
                                    </div>

                                    <input
                                      type="radio"
                                      name="resourceId"
                                      value={resource.id}
                                      checked={isSelected}
                                      disabled={!isActive}
                                      onChange={(e) => {
                                        if (isActive) handleChange(e);
                                      }}
                                      className="hidden"
                                    />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p
                                          className={`font-bold text-sm transition-colors ${
                                            isSelected && isActive
                                              ? "text-orange-700 dark:text-orange-300"
                                              : "text-slate-800 dark:text-slate-200"
                                          }`}
                                        >
                                          {resource.name}
                                        </p>
                                        {/* Status badge */}
                                        <span
                                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            isActive
                                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                              : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                                          }`}
                                        >
                                          {isActive ? "Available" : "Unavailable"}
                                        </span>
                                      </div>

                                      {/* Location + Capacity row */}
                                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        {resource.location && (
                                          <span className="flex items-center gap-1">
                                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {resource.location}
                                          </span>
                                        )}
                                        {resource.capacity != null && (
                                          <span className="flex items-center gap-1">
                                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Capacity {resource.capacity}
                                          </span>
                                        )}
                                      </div>

                                      {/* Description */}
                                      {resource.description && (
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 line-clamp-2">
                                          {resource.description}
                                        </p>
                                      )}

                                      {/* Availability windows */}
                                      {resource.availabilityWindows?.length > 0 && isActive && (
                                        <p className="mt-1 text-[11px] font-medium text-orange-600/80 dark:text-orange-400/80">
                                          🕐 {resource.availabilityWindows[0]}
                                        </p>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Prompt when no category selected */}
                        {!form.categoryId && (
                          <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                            Choose a category above to see available resources.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        When do you need it?
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                        Specify the date and exact timeframe.
                      </p>
                    </div>

                    <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700/50">
                      {/* Date & Time inputs remain unchanged */}
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                          Select Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="date"
                            min={today}
                            value={form.date}
                            onChange={handleChange}
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 focus:border-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-orange-600"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="flex-1">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleChange}
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 focus:border-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-orange-600"
                          />
                        </div>
                        <div className="hidden items-center justify-center pt-8 text-slate-400 sm:flex">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            name="endTime"
                            value={form.endTime}
                            onChange={handleChange}
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 focus:border-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-orange-600"
                          />
                        </div>
                      </div>

                      {form.startTime &&
                        form.endTime &&
                        form.startTime < form.endTime && (
                          <div className="mt-2 animate-[slideDown_0.3s_ease-out] overflow-hidden rounded-2xl bg-orange-50 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-500/30">
                            <div className="px-5 py-4 flex items-center justify-between">
                              <div className="flex items-center gap-3 text-orange-700 dark:text-orange-300">
                                <div className="bg-orange-100 dark:bg-orange-800/50 p-2 rounded-full hidden sm:block">
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <span className="font-semibold tracking-wide">
                                  Total Duration
                                </span>
                              </div>
                              <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                                {(() => {
                                  const [startHour, startMinute] =
                                    form.startTime.split(":").map(Number);
                                  const [endHour, endMinute] = form.endTime
                                    .split(":")
                                    .map(Number);
                                  const mins =
                                    endHour * 60 +
                                    endMinute -
                                    (startHour * 60 + startMinute);
                                  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
                                })()}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Step 3 and Step 4 remain structurally the same with only gradient → solid color changes applied where needed */}

                {step === 3 && (
                  <div className="space-y-5">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Provide Details
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                        Tell us more about the purpose of your booking.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                          Student ID
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          placeholder="e.g. STU-2024-001"
                          value={form.studentId}
                          onChange={handleChange}
                          className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-5 py-4 text-base font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-orange-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-orange-600"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                          Purpose of Booking
                        </label>
                        <textarea
                          name="purpose"
                          rows={3}
                          placeholder="e.g. Group study session for Advanced Algorithms"
                          value={form.purpose}
                          onChange={handleChange}
                          className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white/50 px-5 py-4 text-base font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-orange-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-orange-600"
                        />
                      </div>
                      <div className="rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 dark:border-slate-700/50 dark:bg-slate-800/30">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            Expected Attendees
                          </label>
                          <span className="flex items-center justify-center h-8 w-12 rounded-lg bg-orange-100 text-orange-700 font-black dark:bg-orange-900/60 dark:text-orange-300">
                            {form.expectedAttendees}
                          </span>
                        </div>
                        <input
                          type="range"
                          name="expectedAttendees"
                          min="1"
                          max="50"
                          value={form.expectedAttendees}
                          onChange={handleChange}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600 dark:bg-slate-700"
                        />
                        <div className="mt-3 flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500">
                          <span>1</span>
                          <span>25</span>
                          <span>50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Review & Confirm
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                        Please verify your booking details below.
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border-2 border-slate-100 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/50 relative">
                      <div className="divide-y divide-slate-100/80 dark:divide-slate-700/50 relative z-10">
                        {[
                          { label: "Resource", value: resourceLabel },
                          {
                            label: "Date",
                            value: new Date(form.date).toLocaleDateString(
                              "en-GB",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            ),
                          },
                          {
                            label: "Time Info",
                            value: `${form.startTime} - ${form.endTime} (${(() => {
                              const [sh, sm] = form.startTime
                                .split(":")
                                .map(Number);
                              const [eh, em] = form.endTime
                                .split(":")
                                .map(Number);
                              const m = eh * 60 + em - (sh * 60 + sm);
                              return `${Math.floor(m / 60)}h ${m % 60}m`;
                            })()})`,
                          },
                          { label: "Student ID", value: form.studentId },
                          { label: "Purpose", value: form.purpose },
                          { label: "Attendees", value: form.expectedAttendees },
                        ].map((row, i) => (
                          <div
                            key={row.label}
                            className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                            style={{
                              animation: `fadeIn 0.3s ease-out ${i * 0.05}s forwards`,
                              opacity: 0,
                            }}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 sm:mb-0">
                              {row.label}
                            </span>
                            <span className="sm:max-w-[60%] sm:text-right text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-inner dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-300">
                      <div className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-full hidden sm:block">
                        <svg
                          className="h-5 w-5 text-amber-600 dark:text-amber-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="font-medium leading-relaxed">
                        Your booking will be submitted as{" "}
                        <strong className="bg-amber-200 dark:bg-amber-700/50 px-2 py-0.5 rounded text-amber-900 dark:text-amber-100 ml-1 shadow-sm">
                          PENDING
                        </strong>
                        . An admin will review and approve it shortly.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {step > 1 && (
                <button
                  onClick={back}
                  disabled={animating || loading}
                  className="flex-1 rounded-2xl border-2 border-slate-200 py-4 font-bold text-slate-600 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={next}
                  disabled={animating}
                  className="flex-[2] rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/30 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Continue →
                </button>
              ) : (
                <button
                  id="submit-booking"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] relative overflow-hidden rounded-2xl bg-orange-600 py-4 font-bold text-white shadow-xl shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none group"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Submit Request
                      <svg
                        className="w-5 h-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `,
        }}
      />
    </div>
  );
}