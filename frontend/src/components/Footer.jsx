import { motion } from "framer-motion";
import { Mail, Send, Code, Users } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const social = [
    { icon: Send, href: "#", name: "Twitter" },
    { icon: Users, href: "#", name: "LinkedIn" },
    { icon: Code, href: "#", name: "GitHub" },
    { icon: Mail, href: "#", name: "Email" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <footer className="relative border-t border-orange-100 bg-gradient-to-b from-white to-[#fff5ea]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="flex flex-col gap-4 rounded-[32px] border border-orange-100 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,.08)]">
            <div className="text-2xl font-black tracking-tight text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text">
              CampusFlow
            </div>
            <p className="text-sm text-slate-500">The smart campus hub for catalogues, bookings, incidents, and notifications.</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="mt-12 grid grid-cols-1 gap-10 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { title: "Company", links: ["About", "Roadmap", "Careers", "Press"] },
              { title: "Modules", links: ["Catalogue", "Bookings", "Incidents", "Notifications"] },
              { title: "Resources", links: ["Implementation guide", "Case studies", "Security brief", "Events"] },
              { title: "Support", links: ["Contact", "Status", "OAuth setup", "Terms"] },
            ].map((column) => (
              <motion.div key={column.title} variants={itemVariants}>
                <h4 className="text-base font-semibold text-slate-900">{column.title}</h4>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="transition-colors hover:text-orange-500">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 border-t border-orange-100 pt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <motion.p variants={itemVariants} className="text-sm text-slate-500">
              © {currentYear} BrandHive Studio. All rights reserved.
            </motion.p>

            <motion.div variants={containerVariants} className="flex gap-3">
              {social.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.name}
                    variants={itemVariants}
                    href={item.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-white text-orange-400 transition-all hover:-translate-y-1 hover:bg-gradient-to-r hover:from-orange-500 hover:to-rose-500 hover:text-white"
                    title={item.name}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
