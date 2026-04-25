import { getToken } from './authStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export const userProfileService = {
  getCurrentProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to update user profile');
    }
  },

  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/users/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload picture: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to upload profile picture');
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  },
};
