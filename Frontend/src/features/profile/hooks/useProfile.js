import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { profileService } from '../services/profile.service.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Feature Hook: useProfile
 * Layer: features/profile/hooks/
 * Responsibility: Manages profile form state, dirty tracking, image uploads, validation,
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
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [photoUpdated, setPhotoUpdated] = useState(false);

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
    if (user && JSON.stringify(formData) === JSON.stringify(savedData)) {
      const mapped = mapUserToProfile(user);
      setFormData(mapped);
      setSavedData(mapped);
    }
  }, [user]);

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedData);
  }, [formData, savedData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handlePhotoUpload = async (file) => {
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

    try {
      setIsSaving(true);
      setServerError(null);

      const res = await profileService.uploadAvatar(file);
      const avatarUrl = res?.data?.url || res?.user?.avatar;

      if (avatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
        updateProfile({ avatar: avatarUrl });
        setPhotoUpdated(true);
      }
    } catch (err) {
      console.error('Backend image upload failed:', err.message);
      setServerError(err.message || 'Failed to upload profile photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoRemove = async () => {
    try {
      setIsSaving(true);
      setServerError(null);

      await profileService.deleteAvatar();

      setFormData((prev) => ({ ...prev, avatar: '' }));
      updateProfile({ avatar: '' });
      setPhotoUpdated(true);
    } catch (err) {
      console.error('Backend delete avatar failed:', err.message);
      setServerError(err.message || 'Failed to remove profile photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName?.trim()) {
      errs.fullName = 'Full name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveChanges = async () => {
    if (!validate()) return false;

    setIsSaving(true);
    setServerError(null);

    try {
      const payload = {
        name: formData.fullName.trim(),
        username: formData.username.trim(),
        avatar: formData.avatar,
        jobTitle: formData.jobTitle.trim(),
        bio: formData.bio.trim(),
        phone: formData.phoneNumber.trim(),
        location: formData.location.trim(),
        timezone: formData.timeZone,
        twoFactorEnabled: formData.twoFactorEnabled,
      };

      const response = await profileService.updateProfile(payload);
      const updatedUser = response?.user || payload;

      // Sync with Redux Auth State & localStorage
      updateProfile(updatedUser);

      setSavedData(formData);
      setPhotoUpdated(false);
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

  const cancelChanges = async () => {
    const previousAvatar = savedData.avatar;
    const currentAvatar = formData.avatar;

    setFormData(savedData);
    setPhotoUpdated(false);
    setErrors({});
    setServerError(null);

    // If avatar was changed on server during this session and user canceled, revert avatar in DB
    if (currentAvatar !== previousAvatar) {
      try {
        await profileService.updateProfile({ avatar: previousAvatar });
        updateProfile({ avatar: previousAvatar });
      } catch (err) {
        console.warn('Could not revert avatar on cancel:', err.message);
      }
    }
  };

  const toggle2FA = () => {
    handleChange('twoFactorEnabled', !formData.twoFactorEnabled);
  };

  return {
    formData,
    savedData,
    errors,
    serverError,
    isDirty: isDirty || photoUpdated,
    isSaving,
    isLoading,
    saveSuccess,
    photoUpdated,
    handleChange,
    handlePhotoUpload,
    handlePhotoRemove,
    saveChanges,
    cancelChanges,
    toggle2FA,
  };
}

export default useProfile;
