export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="border-t border-slate-200 bg-white/90 px-4 py-10 text-sm text-slate-500 sm:px-8 lg:px-12"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <p>© {currentYear} CampusOS. Crafted for premium campus operations teams.</p>
        <div className="flex flex-wrap justify-center gap-4 md:justify-end">
          <a href="#home" className="hover:text-slate-900">
            Home
          </a>
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
          <a href="#services" className="hover:text-slate-900">
            Services
          </a>
          <a href="#about" className="hover:text-slate-900">
            About
          </a>
        </div>
      </div>
    </footer>
  );
}
