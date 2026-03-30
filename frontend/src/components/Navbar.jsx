import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();

  const handleScroll = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-orange-100/70 bg-white/85 backdrop-blur-2xl"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex flex-col leading-tight"
          >
            <span className="text-2xl font-black tracking-tight text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text">
              CampusFlow
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-orange-400">
              operations hub
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-orange-500 transition-colors">
              Modules
            </a>
            <a href="#solutions" className="hover:text-orange-500 transition-colors">
              Workflow
            </a>
            <a href="#agency" className="hover:text-orange-500 transition-colors">
              Governance
            </a>
            <a href="#testimonials" className="hover:text-orange-500 transition-colors">
              Stories
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScroll("cta")}
              className="px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-200 rounded-full hover:bg-orange-50 transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 shadow-[0_10px_30px_rgba(249,115,22,.35)] hover:shadow-[0_15px_35px_rgba(249,115,22,.45)] transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
