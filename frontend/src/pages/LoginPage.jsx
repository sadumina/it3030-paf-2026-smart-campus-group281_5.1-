import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, BellRing, CalendarCheck2, Lock, Mail, Sparkles, Wrench } from "lucide-react";
import { googleLogin, loginUser } from "../services/authService";
import { saveAuth } from "../services/authStorage";
import { getDashboardPathForRole } from "../services/roleDashboard";

const GSI_INIT_FLAG = "__smartCampusGsiInitialized";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const loginRole = new URLSearchParams(location.search).get("role");
  const isStudentLogin = loginRole?.toLowerCase() === "student";

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#fffaf5] px-4 py-6 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-orange-200/45 blur-3xl" />
        <div className="absolute -right-20 bottom-14 h-[24rem] w-[24rem] rounded-full bg-amber-200/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="grid overflow-hidden rounded-[2rem] border border-orange-100 bg-white/90 shadow-[0_28px_70px_rgba(148,67,0,0.14)] backdrop-blur-sm lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative border-b border-orange-100 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-6 text-white lg:border-b-0 lg:border-r lg:p-10">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
            <div className="absolute bottom-6 left-8 h-36 w-36 rounded-full bg-amber-100/35 blur-2xl" />

            <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.17em] text-white/95">
              <Sparkles className="h-3.5 w-3.5" />
              Campus Access
            </p>
            <h1 className="mt-4 font-['Outfit'] text-3xl font-extrabold leading-tight md:text-4xl">
              Welcome back to Clever Campus
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/95">
              Sign in to continue bookings, tickets, notifications, and team workflows in one professional
              platform.
            </p>

            <div className="mt-6 space-y-3">
              {[
                {
                  icon: <CalendarCheck2 className="h-5 w-5" />,
                  title: "Resource bookings",
                  subtitle: "Track requests from pending to approved",
                },
                {
                  icon: <Wrench className="h-5 w-5" />,
                  title: "Issue resolution",
                  subtitle: "Follow ticket progress with technician updates",
                },
                {
                  icon: <BellRing className="h-5 w-5" />,
                  title: "Live notifications",
                  subtitle: "Stay informed with role-based alerts",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-white/30 bg-white/15 p-3 backdrop-blur-sm transition hover:bg-white/20"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-white/20 p-2 text-white">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-white/90">{item.subtitle}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-white/25 bg-white/10 p-3">
              {[
                { label: "Uptime", value: "99.9%" },
                { label: "SLA", value: "96.8%" },
                { label: "Active", value: "18k+" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-xs text-white/80">{item.label}</p>
                  <p className="text-sm font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 lg:p-10">
            {isStudentLogin ? (
              <p className="mb-3 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-orange-700">
                Student Login
              </p>
            ) : null}
            <h2 className="font-['Outfit'] text-2xl font-bold text-slate-900 sm:text-3xl">Sign in to your account</h2>
            <p className="mt-2 text-sm text-slate-500">
              {isStudentLogin
                ? "Use your student account to access your campus dashboard."
                : "Use your account credentials to continue."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@university.edu"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50"
                  />
                </div>
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
                className="w-full rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-[0_14px_26px_rgba(249,115,22,0.3)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
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
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Create one now
              </button>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
