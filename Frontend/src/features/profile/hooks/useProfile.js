import { useState, useMemo } from 'react';
import { useAuth } from '../../auth/hooks/useAuth.js';

/**
 * Feature Hook: useProfile
 * Layer: features/profile/hooks/
 * Responsibility: Manages profile form state, dirty tracking, image uploads, validation, and synchronizes with Redux.
 */
export function useProfile() {
  const { user, updateProfile } = useAuth();

  const initialProfile = {
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
    fullName: user?.name || 'Angelina Davis',
    username: user?.username || 'angelina',
    email: user?.email || 'angelina.davis@teamsync.io',
    phoneNumber: user?.phone || '+1 (555) 234-5678',
    jobTitle: user?.jobTitle || 'Lead Product Designer',
    bio: user?.bio || 'Passionate about building intuitive developer platforms and collaborative team systems. Design systems enthusiast and occasional front-end builder.',
    location: user?.location || 'San Francisco, CA',
    timeZone: user?.timezone || 'America/Los_Angeles (GMT-7:00)',
    emailVerified: true,
    twoFactorEnabled: user?.twoFactorEnabled ?? true,
  };

  const [savedData, setSavedData] = useState(initialProfile);
  const [formData, setFormData] = useState(initialProfile);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(savedData);
  }, [formData, savedData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePhotoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange('avatar', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = () => {
    handleChange('avatar', null);
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName?.trim()) {
      errs.fullName = 'Full name is required';
    }
    if (!formData.username?.trim()) {
      errs.username = 'Username is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveChanges = async () => {
    if (!validate()) return false;

    setIsSaving(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSavedData(formData);

    // Sync with Redux Auth State
    updateProfile({
      name: formData.fullName,
      username: formData.username,
      avatar: formData.avatar,
      jobTitle: formData.jobTitle,
      bio: formData.bio,
      phone: formData.phoneNumber,
      location: formData.location,
      timezone: formData.timeZone,
      twoFactorEnabled: formData.twoFactorEnabled,
    });

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    return true;
  };

  const cancelChanges = () => {
    setFormData(savedData);
    setErrors({});
  };

  const toggle2FA = () => {
    handleChange('twoFactorEnabled', !formData.twoFactorEnabled);
  };

  return {
    formData,
    savedData,
    errors,
    isDirty,
    isSaving,
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
