import { toast } from 'react-toastify';

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
    <div>
      <div className="font-semibold">{message}</div>
      <div className="text-sm mt-1 opacity-90">{details}</div>
    </div>,
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
    <div>
      <div className="font-semibold">{message}</div>
      <div className="text-sm mt-1 opacity-90">Current SLA: {slaValue}</div>
    </div>,
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
