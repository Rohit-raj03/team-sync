import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { profileService } from '../services/profile.service.js';

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
    try {
      setIsSaving(true);
      const res = await profileService.uploadAvatar(file);
      const avatarUrl = res?.data?.url || res?.user?.avatar;
      if (avatarUrl) {
        handleChange('avatar', avatarUrl);
        updateProfile({ avatar: avatarUrl });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.warn('Backend image upload failed, falling back to local preview:', err.message);
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange('avatar', e.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoRemove = async () => {
    try {
      setIsSaving(true);
      await profileService.deleteAvatar();
      handleChange('avatar', '');
      updateProfile({ avatar: '' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Backend delete avatar failed:', err.message);
      handleChange('avatar', '');
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
    errors,
    serverError,
    isDirty,
    isSaving,
    isLoading,
    saveSuccess,
    handleChange,
    handlePhotoUpload,
    handlePhotoRemove,
    saveChanges,
    cancelChanges,
    toggle2FA,
  };
}

export default useProfile;
