'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Lock,
  UserPlus,
  Share2,
  Trash2,
  Camera,
  Crown,
  Home,
  Settings,
  UserCheck,
  Clock,
  Activity,
  Shield,
  Tag,
  Users,
  Calendar,
  MessageSquare,
  CalendarDays,
  FolderOpen,
  Image as ImageIcon,
  MoreHorizontal,
  LogOut,
  UserMinus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { DeleteGroupModal } from '@/components/groups/DeleteGroupModal';
import { useGroupToast } from '@/components/groups/GroupToast';
import { useGroupById } from '@/lib/hooks/useGroupById';
import { useDeleteGroup } from '@/lib/hooks/useDeleteGroup';
import { useRemoveGroupMember } from '@/lib/hooks/useGroupMembers';

// ─── TYPES ──────────────────────────────────────────────────────────

type TabKey = 'discussion' | 'members' | 'events' | 'media' | 'files' | 'about';

interface SidebarItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  adminOnly: boolean;
  onClick: () => void;
}

interface ApiGroupMember {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface ApiGroup {
  id: string;
  name: string;
  description: string | null;
  creatorId: string | null;
  creator: ApiGroupMember | null;
  members: ApiGroupMember[];
  _count: { members: number; memories: number };
  createdAt: string;
  updatedAt: string;
}

function memberDisplayName(m: ApiGroupMember): string {
  if (m.firstName || m.lastName) {
    return [m.firstName, m.lastName].filter(Boolean).join(' ');
  }
  return m.email;
}

// ─── HELPERS ────────────────────────────────────────────────────────

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── TAB PLACEHOLDER ────────────────────────────────────────────────

function TabPlaceholder({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-16 text-center">
      <Icon size={40} className="text-gray-200" />
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        This section is coming soon. Check back later.
      </p>
    </div>
  );
}

// ─── MEMBERS TAB ────────────────────────────────────────────────────

type MenuAction = {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  destructive?: boolean;
  action: string;
};

function getMemberMenuActions(
  viewerIsCreator: boolean,
  isSelf: boolean,
  isTargetCreator: boolean
): MenuAction[] {
  if (isTargetCreator) return []; // Cannot perform actions on the creator
  if (viewerIsCreator) {
    return [
      {
        label: 'Remove from Group',
        icon: UserMinus,
        destructive: true,
        action: 'remove',
      },
    ];
  }
  if (isSelf) {
    return [
      {
        label: 'Leave Group',
        icon: LogOut,
        destructive: true,
        action: 'leave',
      },
    ];
  }
  return [];
}

function MembersTab({
  members,
  memberCount,
  currentUserId,
  creatorId,
  onRemoveMember,
}: {
  members: ApiGroupMember[];
  memberCount: number;
  currentUserId: string;
  creatorId: string | null;
  onRemoveMember: (email: string) => void;
}) {
  const viewerIsCreator = currentUserId === creatorId;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">
        Members ({memberCount})
      </h3>
      <div className="space-y-2">
        {members.map((member) => {
          const isSelf = member.id === currentUserId;
          const isTargetCreator = member.id === creatorId;
          const menuActions = getMemberMenuActions(
            viewerIsCreator,
            isSelf,
            isTargetCreator
          );
          const showMenu = menuActions.length > 0;
          const displayName = memberDisplayName(member);

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-skolaroid-blue/10 text-xs font-semibold text-skolaroid-blue">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {displayName}
                    {isSelf && ' (You)'}
                  </span>
                  {isTargetCreator && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <Crown size={10} />
                      Creator
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>

              {showMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                      <MoreHorizontal size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {menuActions.map((action) => (
                      <DropdownMenuItem
                        key={action.label}
                        className={
                          action.destructive
                            ? 'text-red-600 focus:bg-red-50 focus:text-red-600'
                            : ''
                        }
                        onClick={() => onRemoveMember(member.email)}
                      >
                        <action.icon size={14} />
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ABOUT TAB ──────────────────────────────────────────────────────

function AboutTab({ group }: { group: ApiGroup }) {
  const creatorName = group.creator
    ? memberDisplayName(group.creator)
    : 'Unknown';

  return (
    <div className="max-w-lg space-y-6">
      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-900">
          About this group
        </h3>
        {group.description ? (
          <p className="text-sm text-gray-700">{group.description}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No description provided.
          </p>
        )}
      </div>

      {/* Group details */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Group details</h3>

        <div className="flex items-start gap-3">
          <Lock size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          <span className="text-sm text-gray-700">Private group</span>
        </div>

        <div className="flex items-start gap-3">
          <Users size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          <span className="text-sm text-gray-700">
            {group._count.members} members
          </span>
        </div>

        <div className="flex items-start gap-3">
          <Calendar
            size={16}
            className="mt-0.5 shrink-0 text-muted-foreground"
          />
          <span className="text-sm text-gray-700">
            Created {formatFullDate(group.createdAt)}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <Crown size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <span className="text-sm text-gray-700">
            Created by {creatorName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE COMPONENT ─────────────────────────────────────────────────

export default function GroupViewPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('members');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { showSuccess, showError, ToastPortal } = useGroupToast();

  const { data: group, isLoading, error } = useGroupById(groupId);
  const deleteGroup = useDeleteGroup();
  const removeMember = useRemoveGroupMember();

  // ─── LOADING ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  // ─── NOT FOUND / ERROR ──────────────────────────────────────────

  if (!group || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-xl font-bold text-gray-900">Group not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ??
            "The group you're looking for doesn't exist or has been removed."}
        </p>
        <Button
          onClick={() => router.push('/map')}
          className="mt-4 bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Map
        </Button>
      </div>
    );
  }

  // ─── ROLE CHECKS ────────────────────────────────────────────────
  const isCreator = group.members.some((m) => m.id === group.creatorId);

  // ─── TAB CONFIG ─────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'discussion', label: 'Discussion' },
    { key: 'members', label: 'Members' },
    { key: 'events', label: 'Events' },
    { key: 'media', label: 'Media' },
    { key: 'files', label: 'Files' },
    { key: 'about', label: 'About' },
  ];

  // ─── SIDEBAR ITEMS ──────────────────────────────────────────────
  // TODO: Implement admin-only guard via API role check

  const sidebarItems: SidebarItem[] = [
    {
      icon: Home,
      label: 'Home',
      adminOnly: false,
      onClick: () => {
        // TODO: Implement home tab navigation in future sprint
        console.log('Home tab clicked');
      },
    },
    {
      icon: Settings,
      label: 'Group Settings',
      adminOnly: true,
      onClick: () => {
        // TODO: Implement group settings page in future sprint
        console.log('Group settings clicked');
      },
    },
    {
      icon: UserCheck,
      label: 'Member Requests',
      adminOnly: true,
      onClick: () => {
        // TODO: Implement member requests in future sprint
        console.log('Member requests clicked');
      },
    },
    {
      icon: Clock,
      label: 'Pending Posts',
      adminOnly: true,
      onClick: () => {
        // TODO: Implement pending posts in future sprint
        console.log('Pending posts clicked');
      },
    },
    {
      icon: Activity,
      label: 'Activity Log',
      adminOnly: true,
      onClick: () => {
        // TODO: Implement activity log in future sprint
        console.log('Activity log clicked');
      },
    },
    {
      icon: Shield,
      label: 'Moderation',
      adminOnly: true,
      onClick: () => {
        // TODO: Implement moderation in future sprint
        console.log('Moderation clicked');
      },
    },
    {
      icon: Tag,
      label: 'Group Roles',
      adminOnly: true,
      onClick: () => {
        // TODO: Implement group roles in future sprint
        console.log('Group roles clicked');
      },
    },
  ];

  // ─── DELETE HANDLER ─────────────────────────────────────────────

  const handleDelete = () => {
    deleteGroup.mutate(groupId, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        showSuccess(`"${group.name}" has been deleted.`);
        setTimeout(() => router.push('/map'), 1000);
      },
      onError: (err) => {
        setDeleteModalOpen(false);
        showError(err.message);
      },
    });
  };

  // ─── REMOVE MEMBER HANDLER ─────────────────────────────────────

  const handleRemoveMember = (email: string) => {
    removeMember.mutate(
      { groupId, email },
      {
        onSuccess: (_, variables) => {
          showSuccess(`Member ${variables.email} removed`);
        },
        onError: (err) => {
          showError(err.message);
        },
      }
    );
  };

  // ─── RENDER TAB CONTENT ─────────────────────────────────────────

  function renderTabContent() {
    // group is guaranteed to be defined here — guarded by early return above
    const g = group!;
    switch (activeTab) {
      case 'members':
        return (
          <MembersTab
            members={g.members}
            memberCount={g._count.members}
            currentUserId={g.creatorId ?? ''}
            creatorId={g.creatorId}
            onRemoveMember={handleRemoveMember}
          />
        );
      case 'about':
        return <AboutTab group={g} />;
      case 'discussion':
        return <TabPlaceholder label="Discussion" icon={MessageSquare} />;
      case 'events':
        return <TabPlaceholder label="Events" icon={CalendarDays} />;
      case 'media':
        return <TabPlaceholder label="Media" icon={ImageIcon} />;
      case 'files':
        return <TabPlaceholder label="Files" icon={FolderOpen} />;
      default:
        return null;
    }
  }

  // TODO: Render view-only settings for members in future sprint

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Page Header Bar */}
      <div className="flex items-center gap-3 border-b bg-white px-6 py-3">
        <button
          onClick={() => router.push('/map')}
          className="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          Back to Groups
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-sm text-gray-500">Groups / {group.name}</span>
      </div>

      {/* Cover Photo Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-skolaroid-blue/20 to-skolaroid-blue/5">
        <div className="flex h-full items-center justify-center">
          <ImageIcon size={64} className="text-skolaroid-blue/10" />
        </div>
        {/* TODO: Implement cover photo upload in future sprint */}
        <button
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md border bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          disabled
        >
          <Camera size={13} />
          Edit Cover
        </button>
      </div>

      {/* Group Info Bar */}
      <div className="flex items-start justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Lock size={14} />
              Private
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {group._count.members} members
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {group._count.memories} memories
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
            onClick={() => {
              // TODO: Implement invite feature in future sprint
              showSuccess('Invite feature coming soon');
            }}
          >
            <UserPlus size={14} />
            Invite
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              // TODO: Implement share/copy link in future sprint
              console.log('Share clicked');
            }}
          >
            <Share2 size={14} />
            Share
          </Button>
          {isCreator && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 size={14} />
              Delete Group
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b bg-white px-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-skolaroid-blue text-skolaroid-blue'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1">
        {/* Left Sidebar */}
        <div className="hidden w-56 shrink-0 flex-col space-y-1 border-r bg-white p-3 lg:flex">
          {sidebarItems
            .filter((item) => !item.adminOnly || isCreator)
            .map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <item.icon size={16} className="shrink-0 text-gray-500" />
                {item.label}
              </button>
            ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>
      </div>

      {/* Delete Group Modal */}
      <DeleteGroupModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        groupName={group.name}
        onConfirmDelete={handleDelete}
      />

      {/* Toast Portal */}
      <ToastPortal />
    </div>
  );
}
