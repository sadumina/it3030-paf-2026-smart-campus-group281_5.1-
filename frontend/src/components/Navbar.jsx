import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
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
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (window.history?.replaceState) {
      window.history.replaceState(null, "", href);
    }
  };

  useEffect(() => {
    const updateActiveSection = () => {
      setActiveSection(window.location.hash || "#home");
    };

    window.addEventListener("hashchange", updateActiveSection);
    return () => window.removeEventListener("hashchange", updateActiveSection);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 font-display text-xl font-semibold text-slate-950">
            <span className="rounded-md bg-orange-50 p-1.5 text-orange-600">
              <Building2 className="h-4 w-4" />
            </span>
            Clever<span className="text-orange-500">Campus</span>
          </button>

          <nav className="hidden items-center gap-1.5 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => goToSection(link.href)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeSection === link.href
                    ? "bg-orange-50 text-orange-700 shadow-sm"
                    : "text-slate-600 hover:bg-orange-50 hover:text-slate-900"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            {loggedIn ? (
              <button
                type="button"
                onClick={() => navigate(getDashboardPathForRole(auth?.role || "USER"))}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                title="Open dashboard"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-orange-600 text-xs font-bold text-white">
                  {initials}
                </span>
                Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="rounded-md bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        {isMobileMenuOpen ? (
          <div className="absolute left-4 right-4 top-full mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:hidden">
              <nav className="grid gap-1.5">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => goToSection(link.href)}
                    className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      activeSection === link.href
                        ? "bg-orange-50 text-orange-700"
                        : "text-slate-700 hover:bg-orange-50 hover:text-slate-900"
                    }`}
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
                    className="inline-flex items-center gap-2 rounded-md border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-600 text-xs font-bold text-white">
                      {initials}
                    </span>
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="rounded-md border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/register");
                        setIsMobileMenuOpen(false);
                      }}
                      className="rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
