import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { profileService } from '../services/profile.service.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Feature Hook: useProfile
 * Layer: features/profile/hooks/
 * Responsibility: Manages profile form state, dirty tracking, deferred image uploads, validation,
 * communicates with the real backend API, and synchronizes with Redux.
 */
export function useProfile() {
  const { user, updateProfile } = useAuth();

  const mapUserToProfile = (u) => ({
    avatar: u?.avatar || '',
    fullName: u?.name || '',
    username: u?.username || (u?.email ? u.email.split('@')[0] : ''),
    email: u?.email || '',
    phoneNumber: u?.phone || '',
    jobTitle: u?.jobTitle || '',
    bio: u?.bio || '',
    location: u?.location || 'Remote',
    timeZone: u?.timezone || 'UTC (GMT+0:00)',
    emailVerified: true,
    twoFactorEnabled: Boolean(u?.twoFactorEnabled),
  });

  const [savedData, setSavedData] = useState(() => mapUserToProfile(user));
  const [formData, setFormData] = useState(() => mapUserToProfile(user));
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const previewUrlRef = useRef(null);

  // Clean up any lingering object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Sync profile data from server on mount
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const res = await profileService.getProfile();
        const freshUser = res?.user;
        if (freshUser && isMounted) {
          updateProfile(freshUser);
          const mapped = mapUserToProfile(freshUser);
          setFormData(mapped);
          setSavedData(mapped);
        }
      } catch (err) {
        console.warn('Could not refresh profile from server:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync when user prop in Redux changes if form is not dirty
  useEffect(() => {
    if (user && JSON.stringify(formData) === JSON.stringify(savedData) && !pendingAvatarFile && !isAvatarRemoved) {
      const mapped = mapUserToProfile(user);
      setFormData(mapped);
      setSavedData(mapped);
    }
  }, [user]);

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    const isFormModified = JSON.stringify(formData) !== JSON.stringify(savedData);
    const hasPendingFile = Boolean(pendingAvatarFile);
    const hasAvatarRemoval = isAvatarRemoved && Boolean(savedData.avatar);
    return isFormModified || hasPendingFile || hasAvatarRemoval;
  }, [formData, savedData, pendingAvatarFile, isAvatarRemoved]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  /**
   * Only updates the local preview when a file is selected.
   * NO API call is dispatched here. API is called only on Save Changes.
   */
  const handlePhotoSelect = (file) => {
    if (!file) return;

    // Client-side validation: file type
    if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      setServerError('Unsupported file format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Client-side validation: file size (max 5MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setServerError('File size limit exceeded. Maximum allowed size is 5MB.');
      return;
    }

    setServerError(null);

    // Revoke previous preview URL if any
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    // Create local preview URL without triggering any API request
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    // Update pending file and preview
    setPendingAvatarFile(file);
    setIsAvatarRemoved(false);
    setFormData((prev) => ({ ...prev, avatar: previewUrl }));
  };

  /**
   * Only updates local state when avatar is removed.
   * NO API call is dispatched here. API is called only on Save Changes.
   */
  const handlePhotoRemove = () => {
    setServerError(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPendingAvatarFile(null);
    setIsAvatarRemoved(true);
    setFormData((prev) => ({ ...prev, avatar: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName?.trim()) {
      errs.fullName = 'Full name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /**
   * Dispatches upload API and updates profile when user clicks Save Changes.
   */
  const saveChanges = async () => {
    if (!validate()) return false;

    setIsSaving(true);
    setServerError(null);

    try {
      let finalAvatarUrl = formData.avatar;

      // 1. If an image file was selected, upload it to the server now
      if (pendingAvatarFile) {
        const uploadRes = await profileService.uploadAvatar(pendingAvatarFile);
        finalAvatarUrl = uploadRes?.data?.url || uploadRes?.user?.avatar || finalAvatarUrl;

        // Clean up preview URL
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
      } else if (isAvatarRemoved && savedData.avatar) {
        // 2. If avatar was marked for removal, call delete avatar endpoint now
        await profileService.deleteAvatar();
        finalAvatarUrl = '';
      }

      // 3. Update the rest of the profile
      const payload = {
        name: formData.fullName.trim(),
        username: formData.username.trim(),
        avatar: finalAvatarUrl,
        jobTitle: formData.jobTitle.trim(),
        bio: formData.bio.trim(),
        phone: formData.phoneNumber.trim(),
        location: formData.location.trim(),
        timezone: formData.timeZone,
        twoFactorEnabled: formData.twoFactorEnabled,
      };

      const response = await profileService.updateProfile(payload);
      const updatedUser = response?.user || { ...payload, avatar: finalAvatarUrl };

      // Sync with Redux Auth State & localStorage
      updateProfile(updatedUser);

      const syncedProfile = {
        ...formData,
        avatar: finalAvatarUrl,
      };

      setFormData(syncedProfile);
      setSavedData(syncedProfile);
      setPendingAvatarFile(null);
      setIsAvatarRemoved(false);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      return true;
    } catch (err) {
      setIsSaving(false);
      setServerError(err.message || 'Failed to update profile. Please try again.');
      return false;
    }
  };

  const cancelChanges = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPendingAvatarFile(null);
    setIsAvatarRemoved(false);
    setFormData(savedData);
    setErrors({});
    setServerError(null);
  };

  const toggle2FA = () => {
    handleChange('twoFactorEnabled', !formData.twoFactorEnabled);
  };

  return {
    formData,
    savedData,
    pendingAvatarFile,
    isAvatarRemoved,
    errors,
    serverError,
    isDirty,
    isSaving,
    isLoading,
    saveSuccess,
    handleChange,
    handlePhotoSelect,
    handlePhotoUpload: handlePhotoSelect, // backward compatibility
    handlePhotoRemove,
    saveChanges,
    cancelChanges,
    toggle2FA,
  };
}

export default useProfile;
