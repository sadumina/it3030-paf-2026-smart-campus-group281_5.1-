import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Eye, EyeOff, Lock, Mail } from "lucide-react";
import AuthShowcase from "../components/AuthShowcase";
import { googleLogin, loginUser } from "../services/authService";
import { saveAuth } from "../services/authStorage";
import { getDashboardPathForRole } from "../services/roleDashboard";

const GSI_INIT_FLAG = "__cleverCampusGsiInitialized";

const authCardMotion = {
  initial: { opacity: 0, y: 24, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
};

const fieldMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        shape: "rectangular",
        width: 300,
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#fffaf5] px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
        <div className="absolute -right-16 bottom-8 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <motion.div
          className="grid w-full overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_28px_70px_rgba(148,67,0,0.12)] lg:grid-cols-[0.95fr_1.05fr]"
          {...authCardMotion}
        >
          <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="w-full max-w-sm">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </button>

              {isStudentLogin ? (
                <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  Student Login
                </p>
              ) : null}

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.08 }}
              >
                <h1 className="font-['Outfit'] text-4xl font-extrabold text-slate-950">Welcome back!</h1>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                  Sign in to continue your CleverCampus workflow and boost your productivity.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <motion.div className="relative" {...fieldMotion} transition={{ duration: 0.32, delay: 0.14 }}>
                  <Mail className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="h-12 w-full border border-slate-300 bg-white pl-12 pr-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </motion.div>

                <motion.div className="relative" {...fieldMotion} transition={{ duration: 0.32, delay: 0.2 }}>
                  <Lock className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="h-12 w-full border border-slate-300 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-4 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </motion.div>

                <motion.div className="flex justify-end" {...fieldMotion} transition={{ duration: 0.32, delay: 0.26 }}>
                  <button type="button" className="text-xs font-semibold text-slate-700 hover:text-orange-600">
                    Forgot Password?
                  </button>
                </motion.div>

                {error ? <p className="text-center text-sm font-medium text-red-600">{error}</p> : null}
                {message ? (
                  <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-600">
                    <BadgeCheck className="h-4 w-4" />
                    {message}
                  </p>
                ) : null}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full bg-orange-500 px-6 text-sm font-bold text-white shadow-[0_14px_26px_rgba(249,115,22,0.3)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? "Signing in..." : "Login"}
                </motion.button>

                <div className="pt-5">
                  <div className="relative mb-5 flex items-center">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="px-4 text-xs font-semibold text-slate-500">or continue with</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div ref={googleButtonRef} className="flex justify-center" />
                  {!import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                    <p className="mt-2 text-center text-xs text-slate-500">
                      Add VITE_GOOGLE_CLIENT_ID in frontend/.env to enable Google sign-in.
                    </p>
                  ) : null}
                </div>
              </form>

              <p className="mt-12 text-center text-sm text-slate-600">
                Not a member?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Register now
                </button>
              </p>
            </div>
          </section>

          <AuthShowcase />
        </motion.div>
      </div>
    </div>
  );
}

