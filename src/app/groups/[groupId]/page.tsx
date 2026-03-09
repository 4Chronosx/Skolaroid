'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronLeft,
  Globe,
  Lock,
  Eye,
  EyeOff,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  type Group,
  type GroupMember,
  MOCK_GROUPS,
  MOCK_CURRENT_USER_ID,
} from '@/lib/types/group';
import { DeleteGroupModal } from '@/components/groups/DeleteGroupModal';
import { useGroupToast } from '@/components/groups/GroupToast';

// ─── TYPES ──────────────────────────────────────────────────────────

type TabKey = 'discussion' | 'members' | 'events' | 'media' | 'files' | 'about';

interface SidebarItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  adminOnly: boolean;
  onClick: () => void;
}

// ─── HELPERS ────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

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

function MembersTab({
  members,
  memberCount,
}: {
  members: GroupMember[];
  memberCount: number;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">
        Members ({memberCount})
      </h3>
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={member.avatarUrl ?? ''} alt={member.name} />
              <AvatarFallback className="bg-skolaroid-blue/10 text-xs font-semibold text-skolaroid-blue">
                {member.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {member.name}
                </span>
                {member.role === 'OWNER' && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    <Crown size={10} />
                    Owner
                  </span>
                )}
                {member.role === 'ADMIN' && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 px-1.5 py-0 text-[10px]"
                  >
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {member.role.charAt(0) + member.role.slice(1).toLowerCase()} ·
                Joined {formatDate(member.joinedAt)}
              </p>
            </div>

            {/* TODO: Member action menu (kick/promote) — admin only */}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ABOUT TAB ──────────────────────────────────────────────────────

function AboutTab({ group }: { group: Group }) {
  const ownerMember = group.members.find((m) => m.role === 'OWNER');

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
          {group.privacy === 'PUBLIC' ? (
            <Globe
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
          ) : (
            <Lock size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          )}
          <span className="text-sm text-gray-700">
            {group.privacy === 'PUBLIC' ? 'Public' : 'Private'} group
          </span>
        </div>

        <div className="flex items-start gap-3">
          {group.visibility === 'VISIBLE' ? (
            <Eye size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          ) : (
            <EyeOff
              size={16}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
          )}
          <span className="text-sm text-gray-700">
            {group.visibility === 'VISIBLE' ? 'Visible' : 'Hidden'} to search
          </span>
        </div>

        <div className="flex items-start gap-3">
          <Users size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          <span className="text-sm text-gray-700">
            {group.memberCount} members
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
            Owned by {ownerMember?.name ?? 'Unknown'}
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
  const { showSuccess, ToastPortal } = useGroupToast();

  const group = MOCK_GROUPS.find((g) => g.id === groupId);

  // ─── NOT FOUND ──────────────────────────────────────────────────

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-xl font-bold text-gray-900">Group not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The group you&apos;re looking for doesn&apos;t exist or has been
          removed.
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

  const isOwner = group.ownerId === MOCK_CURRENT_USER_ID;
  const isAdmin =
    group.members.find((m) => m.id === MOCK_CURRENT_USER_ID)?.role === 'ADMIN';
  const canSeeAdmin = isOwner || isAdmin;

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
    setDeleteModalOpen(false);
    showSuccess(`"${group.name}" has been deleted.`);
    // TODO: Navigate to /groups list page once that route is created
    setTimeout(() => router.push('/map'), 1000);
  };

  // ─── RENDER TAB CONTENT ─────────────────────────────────────────

  function renderTabContent() {
    // group is guaranteed to be defined here — guarded by early return above
    const g = group!;
    switch (activeTab) {
      case 'members':
        return <MembersTab members={g.members} memberCount={g.memberCount} />;
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
        {group.coverPhotoUrl ? (
          <Image
            src={group.coverPhotoUrl}
            fill
            alt="cover"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon size={64} className="text-skolaroid-blue/10" />
          </div>
        )}
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
              {group.privacy === 'PUBLIC' ? (
                <Globe size={14} />
              ) : (
                <Lock size={14} />
              )}
              {group.privacy === 'PUBLIC' ? 'Public' : 'Private'}
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              {group.visibility === 'VISIBLE' ? (
                <Eye size={14} />
              ) : (
                <EyeOff size={14} />
              )}
              {group.visibility === 'VISIBLE' ? 'Visible' : 'Hidden'}
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {group.memberCount} members
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {group.postCount} posts
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
          {isOwner && (
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
            .filter((item) => !item.adminOnly || canSeeAdmin)
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
