import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/95 backdrop-blur-xl shadow-[0_10px_50px_rgba(249,115,22,0.08)]"
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("/")} className="text-2xl font-semibold text-slate-900">
          Campus<span className="text-orange-500">OS</span>
        </button>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex">
          {navLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ color: "#111827" }}
              className="transition-colors"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"
            onClick={() => navigate("/login")}
          >
            Login
          </motion.button>
          <motion.a
            href="#contact"
            whileHover={{ y: -2 }}
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30"
          >
            Get Started
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}
