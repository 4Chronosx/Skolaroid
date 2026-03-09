'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Crown,
  ShieldCheck,
  ShieldOff,
  UserMinus,
  LogOut,
} from 'lucide-react';
import { type GroupMember, MOCK_CURRENT_USER_ID } from '@/lib/types/group';

// ─── HELPERS ────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

type MenuAction = {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  destructive?: boolean;
};

function getMemberMenuActions(
  viewerIsOwner: boolean,
  isSelf: boolean,
  targetRole: GroupMember['role']
): MenuAction[] {
  if (viewerIsOwner) {
    if (isSelf) {
      return [
        { label: 'Remove as Admin', icon: ShieldOff },
        { label: 'Leave Group', icon: LogOut, destructive: true },
      ];
    }
    if (targetRole === 'ADMIN') {
      return [
        { label: 'Remove as Admin', icon: ShieldOff },
        { label: 'Remove from Group', icon: UserMinus, destructive: true },
      ];
    }
    return [
      { label: 'Invite as Admin', icon: ShieldCheck },
      { label: 'Remove from Group', icon: UserMinus, destructive: true },
    ];
  }
  if (isSelf) {
    return [{ label: 'Leave Group', icon: LogOut, destructive: true }];
  }
  return [];
}

// ─── COMPONENT ──────────────────────────────────────────────────────

interface MembersTabProps {
  members: GroupMember[];
  memberCount: number;
  isOwner: boolean;
}

export function MembersTab({ members, memberCount, isOwner }: MembersTabProps) {
  const currentUserId = MOCK_CURRENT_USER_ID;

  return (
    <div className="space-y-1">
      <div className="px-1 pb-2">
        <p className="text-xs font-medium text-gray-400">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </p>
      </div>

      <div className="space-y-0.5">
        {members.map((member) => {
          const isSelf = member.id === currentUserId;
          const menuActions = getMemberMenuActions(
            isOwner,
            isSelf,
            member.role
          );
          const showMenu = menuActions.length > 0;

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={member.avatarUrl ?? ''} alt={member.name} />
                <AvatarFallback className="bg-gray-100 text-xs font-medium text-gray-600">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-gray-900">
                    {member.name}
                  </span>
                  {member.role === 'OWNER' && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                      <Crown size={9} />
                      Owner
                    </span>
                  )}
                  {member.role === 'ADMIN' && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  Joined {formatDate(member.joinedAt)}
                </p>
              </div>

              {showMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500">
                      <MoreHorizontal size={15} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl">
                    {menuActions.map((action) => (
                      <DropdownMenuItem
                        key={action.label}
                        className={`rounded-lg ${
                          action.destructive
                            ? 'text-red-600 focus:bg-red-50 focus:text-red-600'
                            : ''
                        }`}
                        onClick={() => {
                          // TODO: Wire up action handlers when API is ready
                          console.log(
                            `${action.label} clicked for member ${member.id}`
                          );
                        }}
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
