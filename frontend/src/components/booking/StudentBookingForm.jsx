import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking, getAllBookings } from "../../services/bookingService";
import { getAuth } from "../../services/authStorage";

const RESOURCE_CATEGORIES = [
  { id: "", label: "Select Category..." },
  { id: "lecture_halls", label: "Lecture Halls" },
  { id: "labs", label: "Labs" },
  { id: "meeting_rooms", label: "Meeting Rooms" },
  { id: "equipment", label: "Equipment" },
];

const RESOURCE_OPTIONS = {
  lecture_halls: [
    { value: "LH-A", label: "Lecture Hall A" },
    { value: "LH-B", label: "Lecture Hall B" },
  ],
  labs: [
    { value: "LAB-01", label: "Computer Lab 01" },
    { value: "LAB-02", label: "Computer Lab 02" },
  ],
  meeting_rooms: [
    { value: "SEM-01", label: "Seminar Room 01" },
    { value: "SEM-02", label: "Seminar Room 02" },
    { value: "CONF-01", label: "Conference Room 01" },
  ],
  equipment: [
    { value: "EQ-PROJ", label: "4K Multimedia Projector" },
    { value: "EQ-MIC", label: "Wireless Microphone System" },
    { value: "EQ-CAM", label: "Video Conference Camera" },
  ],
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
                  ? "bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30 scale-100 ring-2 ring-emerald-100 dark:ring-emerald-900"
                  : index + 1 === step
                    ? "bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/40 scale-110 ring-4 ring-orange-100 dark:ring-orange-900/40"
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
                className={`h-full rounded-full transition-all duration-700 ease-in-out ${index + 1 < step ? "w-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "w-0 bg-emerald-500"}`}
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

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
    if (event.target.name === "categoryId") {
      setForm((prev) => ({ ...prev, resourceId: "" })); // Reset resource when category changes
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

        // Match backend overlap logic: existing.start <= requested.end AND existing.end >= requested.start
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

  // Helper to find label across all categories
  const getResourceLabel = (val) => {
    for (const key in RESOURCE_OPTIONS) {
      const found = RESOURCE_OPTIONS[key].find((r) => r.value === val);
      if (found) return found.label;
    }
    return val;
  };

  const resourceLabel = getResourceLabel(form.resourceId);

  if (success) {
    return (
      <div
        className={`${embedded ? "py-10" : "flex min-h-[90vh] items-center justify-center p-6"}`}
      >
        <div
          className={`w-full max-w-md mx-auto text-center animate-[scaleIn_0.5s_ease-out_forwards] ${embedded ? "" : "rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl dark:border-slate-700 dark:bg-slate-900"}`}
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/30">
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

  // Define dynamic animation classes based on state
  const animationClass = animating
    ? direction === "forward"
      ? "opacity-0 -translate-x-10 scale-95"
      : "opacity-0 translate-x-10 scale-95"
    : "opacity-100 translate-x-0 scale-100";

  return (
    <div
      className={`${embedded ? "" : "flex min-h-screen pt-10 sm:pt-0 sm:items-center justify-center p-6 bg-gradient-to-br from-orange-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden"}`}
    >
      {!embedded && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-orange-500/20 blur-[100px] mix-blend-multiply pointer-events-none dark:bg-orange-500/10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-teal-500/20 blur-[100px] mix-blend-multiply pointer-events-none dark:bg-emerald-500/10" />
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
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-emerald-400 pb-2">
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
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        What do you need?
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                        Select a category and choose a specific resource.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                        Resource Category
                      </label>
                      <div className="relative">
                        <select
                          name="categoryId"
                          value={form.categoryId}
                          onChange={handleChange}
                          className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-white/50 px-5 py-4 text-base font-semibold text-slate-700 transition-all duration-200 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-orange-500 dark:focus:bg-slate-800 cursor-pointer"
                        >
                          {RESOURCE_CATEGORIES.map((cat, idx) => (
                            <option key={idx} value={cat.id} disabled={!cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {form.categoryId && RESOURCE_OPTIONS[form.categoryId] && (
                      <div className="space-y-2 animate-[slideDown_0.3s_ease-out]">
                        <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 mt-4 block">
                          Available Resources
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {RESOURCE_OPTIONS[form.categoryId].map(
                            (resource, idx) => (
                              <label
                                key={resource.value}
                                className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition-all duration-300 hover:shadow-md ${
                                  form.resourceId === resource.value
                                    ? "border-orange-500 bg-orange-50/80 shadow-lg shadow-orange-500/10 scale-[1.02] dark:border-orange-500/60 dark:bg-orange-900/30"
                                    : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-orange-500/40"
                                }`}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                              >
                                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white group-hover:border-orange-400 dark:border-slate-600 dark:bg-slate-800">
                                  {form.resourceId === resource.value && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-[scaleIn_0.2s_ease-out]" />
                                  )}
                                </div>
                                <input
                                  type="radio"
                                  name="resourceId"
                                  value={resource.value}
                                  checked={form.resourceId === resource.value}
                                  onChange={handleChange}
                                  className="hidden"
                                />
                                <div className="flex-1">
                                  <p
                                    className={`font-bold transition-colors ${form.resourceId === resource.value ? "text-orange-900 dark:text-orange-200" : "text-slate-800 dark:text-slate-200"}`}
                                  >
                                    {resource.label}
                                  </p>
                                  <p className="text-xs font-medium text-slate-400 mt-0.5 dark:text-slate-500">
                                    {resource.value}
                                  </p>
                                </div>
                              </label>
                            ),
                          )}
                        </div>
                      </div>
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
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-orange-500"
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
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-orange-500"
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
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {form.startTime &&
                        form.endTime &&
                        form.startTime < form.endTime && (
                          <div className="mt-2 animate-[slideDown_0.3s_ease-out] overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-500/30">
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
                          className="w-full rounded-2xl border-2 border-slate-200 bg-white/50 px-5 py-4 text-base font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-orange-500"
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
                          className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white/50 px-5 py-4 text-base font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:border-orange-500"
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
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 dark:bg-slate-700"
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
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg
                          className="w-32 h-32 text-orange-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
                        </svg>
                      </div>
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
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 text-sm text-amber-800 shadow-inner dark:border-amber-500/30 dark:from-amber-900/20 dark:to-orange-900/20 dark:text-amber-300">
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
                  className="flex-[2] relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 py-4 font-bold text-white shadow-xl shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none group"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
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

      {/* Inline styles for animations */}
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
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
}
