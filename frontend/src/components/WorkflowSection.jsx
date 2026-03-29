import { motion } from "framer-motion";
import { BookOpen, CheckCircle, AlertCircle, Wrench } from "lucide-react";

export default function WorkflowSection() {
  const steps = [
    {
      icon: BookOpen,
      title: "Booking",
      description: "Users request resources or spaces",
      gradient: "from-purple-500 to-pink-500",
      number: "01",
    },
    {
      icon: CheckCircle,
      title: "Approval",
      description: "Instant verification and approval",
      gradient: "from-blue-500 to-cyan-400",
      number: "02",
    },
    {
      icon: AlertCircle,
      title: "Incident",
      description: "Issues are automatically detected",
      gradient: "from-pink-500 to-red-500",
      number: "03",
    },
    {
      icon: Wrench,
      title: "Resolution",
      description: "Quick fixes and status updates",
      gradient: "from-cyan-400 to-blue-500",
      number: "04",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="workflow"
      className="relative py-24 bg-gradient-to-b from-white via-blue-50/20 to-white overflow-hidden"
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, 30, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-0 w-80 h-80 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full filter blur-3xl opacity-10"
        />
        <motion.div
          animate={{
            y: [0, -40, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-0 w-80 h-80 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full filter blur-3xl opacity-10"
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
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full border border-blue-200/50 backdrop-blur-sm">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold text-sm">
              Workflow Process
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple 4-Step Process
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From request to resolution in minutes, not days
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Step Card */}
                  <div className="flex flex-col items-center text-center">
                    {/* Number Badge */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`relative mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold text-2xl shadow-lg hover:shadow-2xl transition-all duration-300`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                      <span className="relative z-10">{step.number}</span>
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                      className={`mb-4 p-3 rounded-xl bg-gradient-to-r ${step.gradient} bg-opacity-15`}
                    >
                      <Icon
                        className={`w-6 h-6 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}
                      />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-12 text-cyan-400">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
