import { Building2, CalendarCheck2, LifeBuoy, Mail, PhoneCall } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
];

const productLinks = [
  { label: "Resource Booking", href: "/login?role=student" },
  { label: "Ticket Management", href: "/tickets" },
  { label: "Analytics Dashboard", href: "/admin/analytics" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-slate-200 bg-slate-50 px-4 pb-8 pt-7 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="rounded-md bg-orange-50 p-1.5 text-orange-600">
                <Building2 className="h-4 w-4" />
              </span>
              Clever<span className="text-orange-500">Campus</span>
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              CleverCampus is a professional operations platform for bookings, support workflows,
              and institutional performance.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-slate-950">Quick Links</h3>
            <div className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <a key={link.label} href={link.href} className="block text-sm text-slate-600 transition hover:text-orange-600">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-slate-950">Platform</h3>
            <div className="mt-4 space-y-2">
              {productLinks.map((link) => (
                <a key={link.label} href={link.href} className="block text-sm text-slate-600 transition hover:text-orange-600">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-slate-950">Contact</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                support@clevercampus.io
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-orange-500" />
                +94 11 234 5678
              </p>
              <p className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-orange-500" />
                24/7 service desk coverage
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} CleverCampus. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <CalendarCheck2 className="h-4 w-4 text-orange-500" />
            Trusted by modern campus teams
          </p>
        </div>
      </div>
    </footer>
  );
}

