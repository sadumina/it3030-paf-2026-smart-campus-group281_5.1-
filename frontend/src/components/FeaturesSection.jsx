import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Calendar,
      title: "Smart Booking System",
      description:
        "Intuitive scheduling with conflict detection, resource allocation, and instant confirmations.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      icon: CheckCircle,
      title: "Intelligent Approvals",
      description:
        "Automated approval workflows with customizable rules and instant notifications.",
      gradient: "from-blue-500 to-cyan-400",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      icon: AlertCircle,
      title: "Incident Management",
      description:
        "Real-time incident tracking, prioritization, and assignment to the right teams.",
      gradient: "from-pink-500 to-red-500",
      bgGradient: "from-pink-50 to-red-50",
    },
    {
      icon: Zap,
      title: "Rapid Resolution",
      description:
        "AI-powered solutions and automated workflows to resolve issues in minutes, not hours.",
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="features"
      className="relative py-24 bg-gradient-to-b from-white via-purple-50/20 to-white overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -80, 80, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full filter blur-3xl opacity-15"
        />
        <motion.div
          animate={{
            x: [0, -60, 60, 0],
            y: [0, 100, -100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full filter blur-3xl opacity-15"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-cyan-100 rounded-full border border-purple-200/50 backdrop-blur-sm">
            <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent font-semibold text-sm">
              Core Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive campus management solutions in one powerful platform
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative p-8 rounded-2xl bg-gradient-to-br ${feature.bgGradient} backdrop-blur-xl border border-white/40 overflow-hidden transition-all duration-300`}
              >
                {/* Animated Border on Hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
                  style={{
                    padding: "2px",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div
                    className={`mb-6 inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}
                  >
                    <Icon
                      className={`w-6 h-6 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                    />
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-all duration-300 -z-10`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
