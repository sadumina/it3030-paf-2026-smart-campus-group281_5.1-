import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, BellRing, CalendarCheck2, Wrench } from "lucide-react";
import { googleLogin, loginUser } from "../services/authService";
import { saveAuth } from "../services/authStorage";
import { getDashboardPathForRole } from "../services/roleDashboard";

const GSI_INIT_FLAG = "__smartCampusGsiInitialized";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.12 + i * 0.08, duration: 0.35 },
    }),
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      if (!window[GSI_INIT_FLAG]) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response?.credential) {
              setError("Google sign-in failed");
              return;
            }

            try {
              const authResponse = await googleLogin(response.credential);
              saveAuth(authResponse);
              setMessage(`Welcome, ${authResponse.name}!`);
              navigate(getDashboardPathForRole(authResponse.role));
            } catch (requestError) {
              setError(requestError.message || "Google login failed");
            }
          },
        });
        window[GSI_INIT_FLAG] = true;
      }

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 320,
      });
    };

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      saveAuth(response);
      setMessage(`Welcome back, ${response.name}! Login successful.`);
      navigate(getDashboardPathForRole(response.role));
    } catch (requestError) {
      setError(requestError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#f6f4ee] px-4 py-4 md:px-8 md:py-5">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 50, -20, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-14 top-8 h-80 w-80 rounded-full bg-[#ffb36d]/40 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -45, 25, 0], y: [0, -25, 35, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-16 bottom-6 h-[26rem] w-[26rem] rounded-full bg-[#7bb8ff]/35 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col">
        <div className="grid min-h-0 flex-1 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/60 shadow-[0_35px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden bg-[linear-gradient(148deg,#162845_0%,#2f4f75_36%,#d16e2a_72%,#f39b52_100%)] p-6 text-white md:p-8"
          >
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-14 left-8 h-44 w-44 rounded-full bg-orange-300/35 blur-2xl" />
            <div className="absolute right-16 top-28 h-32 w-32 rounded-full bg-[#ffb36d]/30 blur-2xl" />

            <p className="inline-flex rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffdcae]">
              Campus Operations Hub
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">One Login, Full Campus Control</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-100/90">
              Access facility bookings, incidents, approvals, and live updates through a secure and role-aware
              workspace.
            </p>

            <div className="mt-5 space-y-2.5">
              {[
                {
                  icon: <CalendarCheck2 className="h-5 w-5" />,
                  title: "Booking workflow",
                  subtitle: "PENDING to APPROVED with clear ownership",
                },
                {
                  icon: <Wrench className="h-5 w-5" />,
                  title: "Incident lifecycle",
                  subtitle: "OPEN to CLOSED with technician updates",
                },
                {
                  icon: <BellRing className="h-5 w-5" />,
                  title: "Actionable notifications",
                  subtitle: "Real-time visibility for all stakeholders",
                },
              ].map((item, index) => (
                <motion.article
                  key={item.title}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-start gap-3 rounded-xl border border-white/25 bg-gradient-to-r from-white/14 to-orange-200/12 p-2.5"
                >
                  <div className="mt-0.5 rounded-lg bg-orange-100/20 p-2 text-[#ffe1b9]">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-100/85">{item.subtitle}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/85 p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to continue your smart campus workflows.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0f6e56] focus:ring-4 focus:ring-[#0f6e56]/15"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0f6e56] focus:ring-4 focus:ring-[#0f6e56]/15"
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              {message ? (
                <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <BadgeCheck className="h-4 w-4" />
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#0f6e56] px-6 py-3 font-semibold text-white shadow-lg shadow-[#0f6e56]/25 transition hover:bg-[#0c5a47] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="pt-2">
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  or continue with
                </p>
                <div ref={googleButtonRef} className="flex justify-center" />
                {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <p className="mt-2 text-center text-xs text-slate-500">
                    Add VITE_GOOGLE_CLIENT_ID in frontend/.env to enable Google sign-in.
                  </p>
                ) : null}
              </div>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Need an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-semibold text-[#0f6e56] hover:text-[#0c5a47]"
              >
                Create one now
              </button>
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
