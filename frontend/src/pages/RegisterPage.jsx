import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, User } from "lucide-react";
import AuthShowcase from "../components/AuthShowcase";
import { registerUser } from "../services/authService";
import { saveAuth } from "../services/authStorage";

const authCardMotion = {
  initial: { opacity: 0, y: 24, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
};

const fieldMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      saveAuth(response);
      setMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 700);
    } catch (requestError) {
      setError(requestError.message || "Registration failed");
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
          className="grid w-full overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_28px_70px_rgba(148,67,0,0.12)] lg:grid-cols-[1.05fr_0.95fr]"
          {...authCardMotion}
        >
          <AuthShowcase variant="register" />

          <section className="flex items-center justify-center bg-[#fffdf9] px-6 py-10 sm:px-10 lg:px-12">
            <div className="w-full max-w-sm">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </button>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.08 }}
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">New Student Access</p>
                <h1 className="font-['Outfit'] text-4xl font-extrabold text-slate-950">Join Smart Campus</h1>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                  Create your student profile and start using bookings, support tickets, alerts, and dashboards.
                </p>
              </motion.div>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <motion.div className="relative" {...fieldMotion} transition={{ duration: 0.32, delay: 0.14 }}>
                  <User className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="h-12 w-full border border-slate-300 bg-white pl-12 pr-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </motion.div>

                <motion.div className="relative" {...fieldMotion} transition={{ duration: 0.32, delay: 0.2 }}>
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

                <motion.div className="relative" {...fieldMotion} transition={{ duration: 0.32, delay: 0.26 }}>
                  <Lock className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="h-12 w-full border border-slate-300 bg-white pl-12 pr-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </motion.div>

                <motion.div
                  className="border border-orange-200 bg-orange-50 px-5 py-3 text-center"
                  {...fieldMotion}
                  transition={{ duration: 0.32, delay: 0.32 }}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Account Type</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">Student Account</p>
                </motion.div>

                {error ? <p className="text-center text-sm font-medium text-red-600">{error}</p> : null}
                {message ? <p className="text-center text-sm font-medium text-emerald-600">{message}</p> : null}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full bg-slate-950 px-6 text-sm font-bold text-white shadow-[0_14px_26px_rgba(15,23,42,0.22)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? "Creating account..." : "Register"}
                </motion.button>
              </form>

              <p className="mt-10 text-center text-sm text-slate-600">
                Already a member?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Login now
                </button>
              </p>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
