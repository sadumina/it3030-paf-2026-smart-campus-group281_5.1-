import { toast } from 'react-toastify';
import React from 'react';

export const notifyAlert = {
  success: (message) => toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  error: (message) => toast.error(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  warning: (message) => toast.warning(message, {
    position: 'top-right',
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  info: (message) => toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),

  escalation: (message, details) => toast.warning(
    React.createElement('div', null,
      React.createElement('div', { className: 'font-semibold' }, message),
      React.createElement('div', { className: 'text-sm mt-1 opacity-90' }, details)
    ),
    {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }
  ),

  slaBreached: (message, slaValue) => toast.error(
    React.createElement('div', null,
      React.createElement('div', { className: 'font-semibold' }, message),
      React.createElement('div', { className: 'text-sm mt-1 opacity-90' }, `Current SLA: ${slaValue}`)
    ),
    {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }
  ),
};
