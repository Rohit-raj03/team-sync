import React from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Avatar } from '../../shared/components/ui/Avatar.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Input } from '../../shared/components/ui/Input.jsx';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My Profile" subtitle="Manage your account preferences" />
      <div className="p-8 bg-white rounded-3xl border border-slate-100 space-y-6">
        <div className="flex items-center gap-5">
          <Avatar name={user?.name || 'User'} size="lg" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">{user?.name}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Input label="Full Name" defaultValue={user?.name || ''} />
          <Input label="Email Address" defaultValue={user?.email || ''} disabled />
          <Input label="Role / Title" defaultValue={user?.role || ''} />
        </div>

        <div className="flex justify-end pt-2">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
