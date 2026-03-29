import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 overflow-hidden pt-24">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blob 1 - Purple */}
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, 100, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full filter blur-3xl opacity-20"
        />

        {/* Blob 2 - Blue */}
        <motion.div
          animate={{
            x: [0, -60, 60, 0],
            y: [0, -100, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full filter blur-3xl opacity-20"
        />

        {/* Blob 3 - Pink */}
        <motion.div
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -60, 60, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-40 left-1/2 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full filter blur-3xl opacity-15"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center min-h-screen text-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-block mb-6"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200/50 backdrop-blur-sm">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold text-sm">
                ✨ Powered by AI & Automation
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-gray-900">Smart </span>
            <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Campus Operations
            </span>
            <br />
            <span className="text-gray-900">Powered by </span>
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mb-12 leading-relaxed"
          >
            Transform your campus operations with intelligent automation. Streamline bookings, approvals, incident management, and resolution—all in one intuitive platform.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate("/login")}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group px-8 py-4 bg-white/60 backdrop-blur-lg border border-white/80 text-gray-900 rounded-full font-bold text-lg hover:bg-white/80 hover:shadow-xl transition-all duration-300 flex items-center gap-2">
              <Play className="w-5 h-5 fill-purple-600 text-purple-600" />
              Watch Demo
            </button>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <p className="text-gray-600 font-medium">Trusted by leading universities</p>
            <div className="flex gap-8 items-center justify-center flex-wrap">
              <span className="text-gray-700 font-semibold">50+ Universities</span>
              <span className="w-1 h-1 bg-purple-400 rounded-full" />
              <span className="text-gray-700 font-semibold">100K+ Users</span>
              <span className="w-1 h-1 bg-purple-400 rounded-full" />
              <span className="text-gray-700 font-semibold">99.9% Uptime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
