import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleAuthService } from '../services/googleAuthService';

/**
 * GoogleAuthButton - Reusable Google OAuth login button
 * 
 * Features:
 * - One-click Google login
 * - Beautiful styling matching app design
 * - Loading and error states
 * - Notifications on success/error
 * 
 * Usage:
 * <GoogleAuthButton 
 *   onSuccess={handleLoginSuccess}
 *   onError={handleLoginError}
 * />
 */
export const GoogleAuthButton = ({ onSuccess, onError, text = 'Sign in with Google' }) => {
  const handleSuccess = async (credentialResponse) => {
    try {
      const result = await googleAuthService.handleGoogleLogin(credentialResponse);
      onSuccess?.(result);
    } catch (error) {
      const errorMsg = error.message || 'Google authentication failed';
      onError?.(errorMsg);
      
      // Show error notification
      if (window.notificationCenter) {
        window.notificationCenter.addNotification({
          id: Date.now(),
          title: 'Authentication Failed',
          message: errorMsg,
          type: 'error',
          priority: 'high',
          duration: 0,
          icon: '✕',
        });
      }
    }
  };

  const handleError = () => {
    const errorMsg = 'Google authentication failed';
    onError?.(errorMsg);
    
    if (window.notificationCenter) {
      window.notificationCenter.addNotification({
        id: Date.now(),
        title: 'Authentication Failed',
        message: errorMsg,
        type: 'error',
        priority: 'high',
        duration: 0,
        icon: '✕',
      });
    }
  };

  const clientId = googleAuthService.getGoogleClientId();

  if (!clientId) {
    // Show warning if not configured
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
        <p className="text-xs text-yellow-700">
          Google OAuth not configured. Set VITE_GOOGLE_CLIENT_ID in .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={text}
        theme="outline"
        size="large"
        logo_alignment="left"
      />
    </div>
  );
};
