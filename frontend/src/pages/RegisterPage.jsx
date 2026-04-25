import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, ShieldCheck, Sparkles, User, UserCog } from "lucide-react";
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#fffaf5] px-4 py-6 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
        <div className="absolute -right-16 bottom-12 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
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
            <div className="absolute -right-12 top-6 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
            <div className="absolute -bottom-12 left-8 h-44 w-44 rounded-full bg-amber-100/30 blur-2xl" />

            <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/95">
              <Sparkles className="h-3.5 w-3.5" />
              New Member Onboarding
            </p>
            <h1 className="mt-4 font-['Outfit'] text-3xl font-extrabold leading-tight md:text-4xl">
              Create your campus workspace
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/95">
              Register once and step into one connected platform for resource bookings, incident tracking,
              and operational collaboration.
            </p>

            <div className="mt-6 space-y-3">
              {steps.map((step) => (
                <article
                  key={step.title}
                  className="rounded-xl border border-white/30 bg-white/15 p-3 backdrop-blur-sm transition hover:bg-white/20"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-white/20 p-2 text-white">{step.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="text-xs text-white/90">{step.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-white/25 bg-white/10 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-white/80">Security Standard</p>
              <p className="mt-1 text-sm font-semibold text-white">JWT authentication + encrypted credentials</p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 lg:p-10">
            <h2 className="font-['Outfit'] text-2xl font-bold text-slate-900 sm:text-3xl">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500">Set up your profile and start collaborating instantly.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50"
                  />
                </div>
              </div>

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

              <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
                <p className="text-xs font-semibold text-orange-800">Account Type</p>
                <p className="mt-1 text-sm font-medium text-orange-700">Student Account</p>
                <p className="mt-1 text-xs text-orange-700">
                  Admin and technician roles are assigned later by authorized administrators.
                </p>
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
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50"
                  />
                </div>
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-[0_14px_26px_rgba(249,115,22,0.3)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </button>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
