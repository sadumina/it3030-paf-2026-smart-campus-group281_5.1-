import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Ayana Reed",
    role: "Operations Director",
    comment: "CleverCampus feels like an Apple-level experience for our campus teams. Clean, calm, and insanely usable.",
  },
  {
    name: "Lewis Gardner",
    role: "Facilities Lead",
    comment: "Booking conflicts disappeared. The automation saves hours each week and keeps leadership fully briefed.",
  },
  {
    name: "Sania Kuruwita",
    role: "IT Services",
    comment: "Role-based access + real-time notifications let us support incidents without chasing context.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-white px-4 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">Testimonials</p>
          <h3 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">What Users Say</h3>
          <p className="mt-3 text-lg text-slate-600">Stories from campuses that swapped spreadsheets for a single modern workspace.</p>
        </div>

        <motion.div
          className="mt-12 grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-orange-100/60"
            >
              <div className="mb-4 flex gap-1 text-orange-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700">“{testimonial.comment}”</p>
              <div className="mt-6">
                <p className="text-base font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-sm text-slate-500">{testimonial.role}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

