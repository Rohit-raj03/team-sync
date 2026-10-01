import React, { useState } from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Modal } from '../../shared/components/ui/Modal.jsx';
import { MemberList } from '../../features/team/components/MemberList.jsx';
import { InviteMember } from '../../features/team/components/InviteMember.jsx';
import { useTeam } from '../../features/team/hooks/useTeam.js';
import { UserPlus } from 'lucide-react';

export const TeamPage = () => {
  const { members, inviteMember } = useTeam();
  const [isOpen, setIsOpen] = useState(false);

  const handleInvite = (data) => {
    inviteMember(data);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        subtitle="Manage your team colleagues and roles."
        action={
          <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
            <UserPlus size={16} />
            <span>Invite Member</span>
          </Button>
        }
      />

      <MemberList members={members} />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Invite Teammate"
      >
        <InviteMember onInvite={handleInvite} onCancel={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
};
