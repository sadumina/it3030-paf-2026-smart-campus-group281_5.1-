import React, { useState } from 'react';
import { X, Edit2, Save, Mail, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notifyAlert } from '../../services/notificationHelper';

export const UserProfileModal = ({ isOpen, onClose, user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      notifyAlert.warning('Name cannot be empty');
      return;
    }
    
    setIsSaving(true);
    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
      notifyAlert.success('Profile updated successfully');
    } catch (error) {
      notifyAlert.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  if (!isOpen) return null;

  const userInitials = (user?.name || 'CU')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'CU';

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const avatarVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 } },
    hover: { scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/20 dark:border-slate-700/20 bg-white dark:bg-slate-900 shadow-2xl"
            >
              {/* Gradient Background */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-transparent dark:from-orange-500/5 rounded-full blur-3xl -z-10" />
              
              {/* Header with Gradient */}
              <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-transparent dark:from-orange-600/10 dark:via-orange-500/5 px-6 py-6 border-b border-slate-200/20 dark:border-slate-700/20">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                      Profile Settings
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Manage your account information
                    </p>
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Content */}
              <motion.div variants={contentVariants} initial="hidden" animate="visible" className="px-6 py-6">
                {/* Avatar Section */}
                <motion.div variants={itemVariants} className="mb-6 flex flex-col items-center">
                  <motion.div
                    variants={avatarVariants}
                    whileHover="hover"
                    className="relative"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-0 blur-lg group-hover:opacity-100 transition" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-4xl font-bold text-white shadow-lg">
                      {userInitials}
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {user?.role || 'USER'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1">
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <p className="text-xs font-medium text-green-700 dark:text-green-300">Account Active</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Form Fields - Simplified */}
                <motion.div className="space-y-4">
                  {/* Name Field */}
                  <motion.div variants={itemVariants} className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-2">
                      <motion.div whileHover={{ rotate: 10 }} className="text-orange-600 dark:text-orange-400">
                        <User className="h-4 w-4" />
                      </motion.div>
                      Full Name
                    </label>
                    {isEditing ? (
                      <motion.input
                        key="name-edit"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full rounded-lg border-2 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all duration-200 ${
                          focusedField === 'name'
                            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500'
                        } focus:outline-none`}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <motion.div
                        key="name-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:shadow-md transition-shadow"
                      >
                        {formData.name || <span className="text-slate-400">Not set</span>}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Email Field */}
                  <motion.div variants={itemVariants} className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-2">
                      <motion.div whileHover={{ rotate: 10 }} className="text-orange-600 dark:text-orange-400">
                        <Mail className="h-4 w-4" />
                      </motion.div>
                      Email Address
                    </label>
                    <motion.div
                      className="relative rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:shadow-md transition-shadow"
                    >
                      {formData.email || <span className="text-slate-400">Not set</span>}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3 border-t border-slate-200/20 dark:border-slate-700/20 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 px-6 py-4"
              >
                {isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <motion.div
                        animate={isSaving ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 1, repeat: isSaving ? Infinity : 0 }}
                      >
                        <Save className="h-4 w-4" />
                      </motion.div>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md"
                    >
                      Close
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:shadow-xl hover:shadow-orange-500/40"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </motion.button>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
