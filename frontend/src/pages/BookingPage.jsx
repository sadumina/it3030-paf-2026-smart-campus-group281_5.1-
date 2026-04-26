import { useNavigate } from "react-router-dom";

export default function BookingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, #6366f1, transparent 70%)",
            animation: "pulse 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, #a855f7, transparent 70%)",
            animation: "pulse 6s ease-in-out infinite 2s",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
          <span className="text-white/80 text-sm font-medium tracking-wide">
            CleverCampus Booking System
          </span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
          Reserve Your{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #818cf8, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Campus Space
          </span>
        </h1>
        <p className="text-lg text-white/60 mb-10 max-w-lg mx-auto leading-relaxed">
          Easily book labs, lecture halls, seminar rooms, and more — all in one
          place. Fast, trackable, and hassle-free.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["📅 Date & Time Picker", "🏫 Multiple Venues", "📋 Instant Confirmation"].map(
            (f) => (
              <span
                key={f}
                className="bg-white/10 border border-white/20 text-white/80 text-sm rounded-full px-4 py-1.5 backdrop-blur-sm"
              >
                {f}
              </span>
            )
          )}
        </div>

        {/* CTA Button */}
        <button
          id="go-to-booking-form"
          onClick={() => navigate("/student/booking")}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40"
          style={{ boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}
        >
          <span>Book a Resource</span>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 mt-14">
          {[
            { icon: "⚡", label: "Instant", sub: "Booking" },
            { icon: "🔒", label: "Secure", sub: "Process" },
            { icon: "📊", label: "Track", sub: "Status" },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
            >
              <p className="text-3xl mb-1">{c.icon}</p>
              <p className="text-white font-semibold text-sm">{c.label}</p>
              <p className="text-white/50 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}

