import { saveAuth } from './authStorage';
import { API_BASE_URL } from '../config/api';

/**
 * Google OAuth Service
 * Handles Google login/registration via OAuth 2.0
 */

export const googleAuthService = {
  /**
   * Handle Google OAuth success response
   * @param {Object} credentialResponse - Response from GoogleLogin component
   * @param {string} credentialResponse.credential - Google JWT ID token
   * @returns {Promise<Object>} - Auth response from backend
   */
  async handleGoogleLogin(credentialResponse) {
    if (!credentialResponse?.credential) {
      throw new Error('No credential received from Google');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/oauth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
          role: 'USER', // Google registration always starts as USER
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      // Save authentication to local storage
      if (data.token) {
        saveAuth({
          token: data.token,
          user: {
            id: data.userId,
            name: data.userName,
            email: data.userEmail,
            role: data.role,
          },
        });
      }

      return data;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  },

  /**
   * Handle Google OAuth error
   * @param {Object} error - Error object from GoogleLogin
   */
  handleGoogleError(error) {
    console.error('Google login failed:', error);
    throw new Error('Google login failed. Please try again.');
  },

  /**
   * Get Google Client ID from environment
   * @returns {string} - Google Client ID
   */
  getGoogleClientId() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env');
      return '';
    }
    return clientId;
  },

  /**
   * Check if Google OAuth is configured
   * @returns {boolean} - True if configured
   */
  isGoogleConfigured() {
    return !!this.getGoogleClientId();
  },
};
