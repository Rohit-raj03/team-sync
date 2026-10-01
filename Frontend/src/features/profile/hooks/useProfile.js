import { useState, useMemo } from 'react';

/**
 * Feature Hook: useProfile
 * Layer: features/profile/hooks/
 * Responsibility: Manages profile form state, dirty tracking, image uploads, validation, and security preferences.
 */
export function useProfile() {
  const initialProfile = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
    fullName: 'Angelina Davis',
    username: 'angelina',
    email: 'angelina.davis@teamsync.io',
    phoneNumber: '+1 (555) 234-5678',
    jobTitle: 'Lead Product Designer',
    bio: 'Passionate about building intuitive developer platforms and collaborative team systems. Design systems enthusiast and occasional front-end builder.',
    location: 'San Francisco, CA',
    timeZone: 'America/Los_Angeles (GMT-7:00)',
    emailVerified: true,
    twoFactorEnabled: true,
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
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username)) {
      errs.username = 'Username can only contain letters, numbers, dashes, and underscores';
    }
    if (!formData.email?.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveChanges = async () => {
    if (!validate()) return false;

    setIsSaving(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSavedData(formData);
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

