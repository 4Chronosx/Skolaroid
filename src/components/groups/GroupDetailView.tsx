'use client';

import { useState } from 'react';
import { type Group, MOCK_CURRENT_USER_ID } from '@/lib/types/group';
import {
  Globe,
  Lock,
  Users,
  Image as ImageIcon,
  Info,
  UserPlus,
  Share2,
  Trash2,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MembersTab } from '@/components/groups/tabs/MembersTab';
import { MediaTab } from '@/components/groups/tabs/MediaTab';
import { AboutTab } from '@/components/groups/tabs/AboutTab';
import { InviteMembersModal } from '@/components/groups/InviteMembersModal';
import { ShareGroupModal } from '@/components/groups/ShareGroupModal';
import { LeaveGroupModal } from '@/components/groups/LeaveGroupModal';
import { DeleteGroupModal } from '@/components/groups/DeleteGroupModal';

interface GroupDetailViewProps {
  group: Group;
  onGroupDeleted: (groupId: string) => void;
  showSuccess: (message: string) => void;
}

export function GroupDetailView({
  group,
  onGroupDeleted,
  showSuccess,
}: GroupDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'media' | 'about'>(
    'members'
  );
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const isOwner = group.ownerId === MOCK_CURRENT_USER_ID;

  const tabs: {
    key: 'members' | 'media' | 'about';
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: 'members', label: 'Members', icon: <Users size={14} /> },
    { key: 'media', label: 'Media', icon: <ImageIcon size={14} /> },
    { key: 'about', label: 'About', icon: <Info size={14} /> },
  ];

  const handleDelete = () => {
    setDeleteModalOpen(false);
    onGroupDeleted(group.id);
  };

  const handleLeave = () => {
    setLeaveModalOpen(false);
    // TODO: API call to leave group
    onGroupDeleted(group.id);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Group Header */}
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-gray-900">
              {group.name}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              {group.privacy === 'PUBLIC' ? (
                <Globe size={12} />
              ) : (
                <Lock size={12} />
              )}
              <span>{group.privacy === 'PUBLIC' ? 'Public' : 'Private'}</span>
              <span className="text-gray-200">·</span>
              <span>{group.memberCount} members</span>
              <span className="text-gray-200">·</span>
              <span>{group.postCount} posts</span>
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                className="gap-2 rounded-lg"
                onClick={() => setInviteModalOpen(true)}
              >
                <UserPlus size={14} />
                Invite Members
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 rounded-lg"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 size={14} />
                Share Group
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isOwner && (
                <DropdownMenuItem
                  className="gap-2 rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={() => setLeaveModalOpen(true)}
                >
                  <LogOut size={14} />
                  Leave Group
                </DropdownMenuItem>
              )}
              {isOwner && (
                <DropdownMenuItem
                  className="gap-2 rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 size={14} />
                  Delete Group
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 px-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto p-4">
        {activeTab === 'members' && (
          <MembersTab
            members={group.members}
            memberCount={group.memberCount}
            isOwner={isOwner}
          />
        )}
        {activeTab === 'media' && <MediaTab />}
        {activeTab === 'about' && <AboutTab group={group} />}
      </div>

      {/* Action Modals */}
      <InviteMembersModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        groupName={group.name}
        groupId={group.id}
        showSuccess={showSuccess}
      />

      <ShareGroupModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        groupName={group.name}
        groupId={group.id}
        showSuccess={showSuccess}
      />

      <LeaveGroupModal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        groupName={group.name}
        onConfirmLeave={handleLeave}
      />

      <DeleteGroupModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        groupName={group.name}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
}
