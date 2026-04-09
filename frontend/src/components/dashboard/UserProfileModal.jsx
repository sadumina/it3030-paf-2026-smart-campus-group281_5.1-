import React, { useState } from 'react';
import { X, Edit2, Save, Mail, User } from 'lucide-react';
import { notifyAlert } from '../../services/notificationHelper';

export const UserProfileModal = ({ isOpen, onClose, user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [isSaving, setIsSaving] = useState(false);

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
      phone: user?.phone || '',
      department: user?.department || '',
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              User Profile
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Avatar Section */}
            <div className="mb-6 flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-3xl font-bold text-white shadow-lg">
                {userInitials}
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                {user?.role || 'USER'}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  <User className="h-3.5 w-3.5" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="mt-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100">
                    {formData.name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5" />
                  Email Address
                </label>
                <p className="mt-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100">
                  {formData.email || 'Not set'}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Email cannot be changed. Contact admin to modify.
                </p>
              </div>

              {/* Phone Field */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="mt-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100">
                    {formData.phone || 'Not set'}
                  </p>
                )}
              </div>

              {/* Department Field */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter your department"
                  />
                ) : (
                  <p className="mt-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100">
                    {formData.department || 'Not set'}
                  </p>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="mt-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                Account Status
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-sm text-slate-700 dark:text-slate-300">Active</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
