import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, UserCog } from "lucide-react";
import { registerUser } from "../services/authService";
import { saveAuth } from "../services/authStorage";

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

  const steps = [
    {
      title: "Create your identity",
      detail: "Set up account credentials with role-based access.",
      icon: <UserCog className="h-4 w-4" />,
    },
    {
      title: "Secure by default",
      detail: "Passwords are encrypted and APIs are JWT-protected.",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      title: "Start collaborating",
      detail: "Jump into bookings, tickets, and live notifications.",
      icon: <Sparkles className="h-4 w-4" />,
    },
  ];

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
        role: form.role,
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
    <div className="relative h-screen overflow-hidden bg-[#f6f4ee] px-4 py-4 md:px-8 md:py-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-16 h-72 w-72 rounded-full bg-[#ffd2a5]/45 blur-3xl" />
        <div className="absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-[#8bc4ff]/35 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative z-10 mx-auto flex h-full max-w-6xl flex-col">
        <div className="grid min-h-0 flex-1 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/65 shadow-[0_35px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
          <section className="relative overflow-hidden bg-[linear-gradient(160deg,#7b2d26_0%,#a1452b_45%,#f18f4f_100%)] p-6 text-white md:p-8">
            <div className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-12 left-6 h-40 w-40 rounded-full bg-[#ffd4aa]/30 blur-2xl" />

            <p className="inline-flex rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#fff1de]">
              New Member Onboarding
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">Create your campus workspace</h1>
            <p className="mt-3 max-w-xl text-sm text-white/90">
              Register once and step into a connected system for resource bookings, maintenance coordination, and team
              notifications.
            </p>

            <div className="mt-5 space-y-2.5">
              {steps.map((step, index) => (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08, duration: 0.35 }}
                  className="flex items-start gap-3 rounded-xl border border-white/25 bg-white/15 p-2.5"
                >
                  <div className="mt-0.5 rounded-lg bg-white/20 p-2 text-[#ffe6cc]">{step.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-white/90">{step.detail}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="bg-white/90 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500">Set up your profile and start collaborating instantly.</p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15"
                />
              </div>

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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15"
                />
              </div>

              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15"
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TECHNICIAN">Technician</option>
                </select>
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
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#a1452b] focus:ring-4 focus:ring-[#a1452b]/15"
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#a1452b] px-6 py-3 font-semibold text-white shadow-lg shadow-[#a1452b]/25 transition hover:bg-[#873922] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-[#a1452b] hover:text-[#873922]"
              >
                Sign in
              </button>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
