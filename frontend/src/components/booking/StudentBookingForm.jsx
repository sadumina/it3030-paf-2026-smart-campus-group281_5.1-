import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../services/bookingService";
import { getAuth } from "../../services/authStorage";

const RESOURCE_OPTIONS = [
  { value: "LAB-01", label: "Computer Lab 01" },
  { value: "LAB-02", label: "Computer Lab 02" },
  { value: "LH-A", label: "Lecture Hall A" },
  { value: "LH-B", label: "Lecture Hall B" },
  { value: "SEM-01", label: "Seminar Room 01" },
  { value: "SEM-02", label: "Seminar Room 02" },
  { value: "CONF-01", label: "Conference Room 01" },
];

function StepIndicator({ step }) {
  const steps = ["Resource", "Date & Time", "Details", "Review"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i + 1 < step
                  ? "bg-indigo-600 text-white"
                  : i + 1 === step
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                i + 1 === step ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-1 mb-4 transition-all duration-300 ${
                i + 1 < step ? "bg-indigo-500" : "bg-slate-200"
              }`}
            />
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

  const [form, setForm] = useState({
    resourceId: "",
    userId: accountUserId,
    studentId: "",
    date: today,
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validateStep = () => {
    if (step === 1 && !form.resourceId) {
      setError("Please select a resource.");
      return false;
    }
    if (step === 2) {
      if (!form.startTime || !form.endTime) {
        setError("Please select both start and end times.");
        return false;
      }
      const now = new Date();
      const selStart = new Date(`${form.date}T${form.startTime}`);
      if (selStart < now) {
        setError("Start time cannot be in the past.");
        return false;
      }
      if (form.startTime >= form.endTime) {
        setError("End time must be after start time.");
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

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

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
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to submit booking. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resourceLabel =
    RESOURCE_OPTIONS.find((r) => r.value === form.resourceId)?.label ||
    form.resourceId;

  if (success) {
    return (
      <div
        className={`${embedded ? "" : "min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center p-6"}`}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Booking Submitted!
          </h2>
          <p className="text-slate-500 mb-2">
            Your request for <strong>{resourceLabel}</strong> has been
            submitted.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Status:{" "}
            <span className="font-semibold text-amber-500">PENDING</span> — an
            admin will review it shortly.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setStep(1);
                setForm({
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
              className="flex-1 border-2 border-indigo-100 text-indigo-600 font-semibold py-3 rounded-xl hover:bg-indigo-50 transition"
            >
              New Booking
            </button>
            {embedded ? (
              <button
                onClick={() => onClose?.()}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition"
              >
                Close
              </button>
            ) : (
              <button
                onClick={() => navigate("/dashboard/bookings")}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition"
              >
                Back to Bookings
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${embedded ? "" : "min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center p-6"}`}
    >
      <div className="w-full max-w-xl">
        {/* Header */}
        {!embedded && (
          <div className="text-center mb-6">
            <button
              onClick={() => navigate("/dashboard/bookings")}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition mb-4"
            >
              <svg
                className="w-4 h-4"
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
            <h1 className="text-3xl font-extrabold text-white">
              Resource Booking
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Fill in the details to submit your request
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <StepIndicator step={step} />

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Step 1: Resource */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Select a Resource
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {RESOURCE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      form.resourceId === opt.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="resourceId"
                      value={opt.value}
                      checked={form.resourceId === opt.value}
                      onChange={handleChange}
                      className="accent-indigo-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-700">
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-400">{opt.value}</p>
                    </div>
                    {form.resourceId === opt.value && (
                      <span className="ml-auto text-indigo-600">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Select Date & Time
              </h3>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  min={today}
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 transition"
                  />
                </div>
              </div>
              {form.startTime &&
                form.endTime &&
                form.startTime < form.endTime && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-sm text-indigo-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Duration:{" "}
                    {(() => {
                      const [sh, sm] = form.startTime.split(":").map(Number);
                      const [eh, em] = form.endTime.split(":").map(Number);
                      const mins = eh * 60 + em - (sh * 60 + sm);
                      return `${Math.floor(mins / 60)}h ${mins % 60}m`;
                    })()}
                  </div>
                )}
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Your Details
              </h3>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  placeholder="e.g. STU-2024-001"
                  value={form.studentId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 transition placeholder-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Purpose of Booking
                </label>
                <textarea
                  name="purpose"
                  rows={3}
                  placeholder="e.g. Group study session for Advanced Algorithms"
                  value={form.purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 transition placeholder-slate-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Expected Attendees:{" "}
                  <span className="text-indigo-600 font-bold">
                    {form.expectedAttendees}
                  </span>
                </label>
                <input
                  type="range"
                  name="expectedAttendees"
                  min="1"
                  max="50"
                  value={form.expectedAttendees}
                  onChange={handleChange}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Review Your Booking
              </h3>
              <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100">
                {[
                  { label: "Resource", value: resourceLabel },
                  {
                    label: "Date",
                    value: new Date(form.date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                  { label: "Start Time", value: form.startTime },
                  { label: "End Time", value: form.endTime },
                  { label: "Student ID", value: form.studentId },
                  { label: "Purpose", value: form.purpose },
                  { label: "Attendees", value: form.expectedAttendees },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-start px-4 py-3"
                  >
                    <span className="text-sm text-slate-500 font-medium">
                      {row.label}
                    </span>
                    <span className="text-sm text-slate-800 font-semibold text-right max-w-[55%]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Your booking will be submitted as{" "}
                <strong className="ml-1">PENDING</strong>. An admin will approve
                or reject it.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={back}
                className="flex-1 border-2 border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={next}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-indigo-200"
              >
                Continue →
              </button>
            ) : (
              <button
                id="submit-booking"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
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
                  "Submit Booking Request"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
