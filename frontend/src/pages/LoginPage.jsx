import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { googleLogin, loginUser } from "../services/authService";
import { saveAuth } from "../services/authStorage";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

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
            navigate("/dashboard");
          } catch (requestError) {
            setError(requestError.message || "Google login failed");
          }
        },
      });

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
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fffaf4] via-[#fffdf9] to-[#eef5ff] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 30, -30, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-14 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -35, 25, 0], y: [0, -30, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto w-full max-w-md"
      >
        <button
          onClick={() => navigate("/")}
          className="mb-7 flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-orange-500"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>

        <div className="rounded-3xl border border-orange-100/80 bg-white/90 p-8 shadow-[0_25px_70px_rgba(15,23,42,0.1)] backdrop-blur-sm">
          <p className="mb-3 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">
            Clever Campus Platform
          </p>
          <h1 className="text-3xl font-bold leading-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to track bookings, incidents, and service alerts.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
              className="w-full rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
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

          <p className="mt-6 text-center text-sm text-slate-600">
            Need an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              Register here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
