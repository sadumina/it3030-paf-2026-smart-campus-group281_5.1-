import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { getAuth, isAuthenticated } from "../services/authStorage";
import { getDashboardPathForRole } from "../services/roleDashboard";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => window.location.hash || "#home");
  const auth = getAuth();
  const loggedIn = isAuthenticated();
  const initials = (auth?.name || "Campus User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CU";

  const goToSection = (href) => {
    setActiveSection(href);
    setIsMobileMenuOpen(false);
    window.location.hash = href;
  };

  useEffect(() => {
    const updateActiveSection = () => {
      setActiveSection(window.location.hash || "#home");
    };

    window.addEventListener("hashchange", updateActiveSection);
    return () => window.removeEventListener("hashchange", updateActiveSection);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-orange-200/70 bg-gradient-to-r from-orange-50/80 via-white/80 to-amber-50/80 backdrop-blur-xl"
    >
      <div className="mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-orange-100/80 bg-gradient-to-r from-white/85 via-orange-50/55 to-white/85 px-4 py-3 shadow-[0_10px_30px_rgba(249,115,22,0.12)] backdrop-blur-xl">
          <button onClick={() => navigate("/")} className="text-xl font-semibold text-slate-900">
            Clever<span className="text-orange-500">Campus</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ y: -1 }}
                onClick={() => setActiveSection(link.href)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeSection === link.href
                    ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {loggedIn ? (
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                onClick={() => navigate(getDashboardPathForRole(auth?.role || "USER"))}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1.5 text-sm font-semibold text-slate-900 shadow-sm"
                title="Open profile dashboard"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white shadow-[0_6px_16px_rgba(249,115,22,0.35)]">
                  {initials}
                </span>
                <span className="sr-only">Profile</span>
              </motion.button>
            ) : (
              <>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                  onClick={() => navigate("/login")}
                >
                  Login
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md"
                  onClick={() => navigate("/login?role=student")}
                >
                  Login as Student
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(249,115,22,0.35)]"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl md:hidden"
            >
              <nav className="grid gap-1.5">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => goToSection(link.href)}
                    className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3">
                {loggedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate(getDashboardPathForRole(auth?.role || "USER"));
                      setIsMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white">
                      {initials}
                    </span>
                    Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/login?role=student");
                        setIsMobileMenuOpen(false);
                      }}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Login as Student
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/register");
                        setIsMobileMenuOpen(false);
                      }}
                      className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
