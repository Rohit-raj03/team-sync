import toast from 'react-hot-toast';

/**
 * Extracts a human-friendly error message from any error shape.
 * Returns the meaningful server error message if available, otherwise fallback.
 */
export const extractErrorMessage = (err, fallback = 'Something went wrong.') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (err.data?.message) return err.data.message;
  if (err.message && err.message !== 'Network Error' && !err.message.includes('unexpected')) {
    return err.message;
  }
  return fallback;
};

/**
 * TeamSync Unified Toast Notification Utility
 * Follows minimal & modern SaaS design principles.
 */
export const showToast = {
  // Generic primitives
  success: (message) => toast.success(message),
  error: (err, fallback = 'Something went wrong.') => {
    return toast.error(extractErrorMessage(err, fallback));
  },
  loading: (message) => toast.loading(message),
  dismiss: (id) => toast.dismiss(id),

  // Promise toast with loading -> success / error transitions
  promise: (promise, messages = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: (err) => extractErrorMessage(err, messages.error || 'Something went wrong.'),
    });
  },

  // Authentication Notifications
  auth: {
    loginSuccess: () => toast.success('Welcome back!'),
    loginError: (err) => {
      const msg = extractErrorMessage(err, 'Invalid email or password.');
      return toast.error(msg === 'Login failed' ? 'Invalid email or password.' : msg);
    },
    registerSuccess: () => toast.success('Account created successfully.'),
    registerError: (err) => toast.error(extractErrorMessage(err, 'Something went wrong.')),
    logoutSuccess: () => toast.success('Logged out successfully.'),
  },

  // Task Notifications
  tasks: {
    created: () => toast.success('Task created.'),
    updated: () => toast.success('Task updated.'),
    deleted: () => toast.success('Task deleted.'),
    deleteFailed: (err) => toast.error(extractErrorMessage(err, 'Failed to delete task.')),
    error: (err) => toast.error(extractErrorMessage(err, 'Something went wrong.')),
  },

  // Attachment Notifications
  attachments: {
    uploadStarted: (count = 1) =>
      toast.loading(`Uploading ${count} attachment${count > 1 ? 's' : ''}...`, {
        id: 'upload-attachment-toast',
      }),
    uploadCompleted: (count = 1) => {
      toast.dismiss('upload-attachment-toast');
      return toast.success(
        `${count} attachment${count > 1 ? 's' : ''} uploaded.`
      );
    },
    uploadFailed: (err) => {
      toast.dismiss('upload-attachment-toast');
      return toast.error(
        extractErrorMessage(err, 'Failed to upload attachment.')
      );
    },
    removed: () => toast.success('Attachment removed.'),
    removeFailed: (err) =>
      toast.error(extractErrorMessage(err, 'Failed to remove attachment.')),
  },

  // Project Notifications
  projects: {
    created: () => toast.success('Project created.'),
    updated: () => toast.success('Project updated.'),
    deleted: () => toast.success('Project deleted.'),
    deleteFailed: (err) => toast.error(extractErrorMessage(err, 'Failed to delete project.')),
    error: (err) => toast.error(extractErrorMessage(err, 'Something went wrong.')),
  },

  // Server error fallback
  serverError: (err) => toast.error(extractErrorMessage(err, 'Something went wrong.')),
};

export { toast };
export default showToast;

