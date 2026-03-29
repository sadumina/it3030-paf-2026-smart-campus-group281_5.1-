import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section
      id="cta"
      className="relative py-24 overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500" />

      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl opacity-10"
        />
        <motion.div
          animate={{
            x: [0, -80, 80, 0],
            y: [0, 60, -60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-white rounded-full filter blur-3xl opacity-10"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex justify-center mb-8"
          >
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Heading */}
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Transform Your
            <br />
            Campus Today
          </h2>

          {/* Description */}
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join hundreds of universities already using InnovateU to streamline operations, boost productivity, and create better campus experiences.
          </p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <button
              onClick={() => navigate("/login")}
              className="group px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-lg border border-white/40 text-white rounded-full font-bold text-lg hover:bg-white/30 transition-all duration-300">
              Schedule Demo
            </button>
          </motion.div>

          {/* Trust Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/80 font-medium"
          >
            ✓ 14-day free trial • No credit card required • Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
