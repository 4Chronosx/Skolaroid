'use client';

import { useState, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type GroupMember, type GroupMemberRole } from '@/lib/types/group';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Crown,
  ShieldCheck,
  ShieldOff,
  UserMinus,
  Search,
} from 'lucide-react';

interface MembersTabProps {
  members: GroupMember[];
  isOwner: boolean;
  currentUserId: string;
}

type RoleFilterType = 'ALL' | GroupMemberRole;

export function MembersTab({
  members,
  isOwner,
  currentUserId,
}: MembersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('ALL');

  // Filter members based on search query and role filter
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Apply search filter (case-insensitive substring match on name)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((member) =>
        member.name.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((member) => member.role === roleFilter);
    }

    return filtered;
  }, [members, searchQuery, roleFilter]);

  const handlePromoteToAdmin = (memberId: string) => {
    console.log('Promote to admin:', memberId);
    // TODO: Implement API call
  };

  const handleRemoveAdmin = (memberId: string) => {
    console.log('Remove admin:', memberId);
    // TODO: Implement API call
  };

  const handleRemoveMember = (memberId: string) => {
    console.log('Remove member:', memberId);
    // TODO: Implement API call
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getMemberInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col">
      {/* Search and Filter Controls */}
      <div className="border-b border-gray-100 px-5 py-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3"
          />
        </div>

        {/* Role Filter Buttons */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Role:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                roleFilter === 'ALL'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('OWNER')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                roleFilter === 'OWNER'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Owner
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                roleFilter === 'ADMIN'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Admin
            </button>
            <button
              onClick={() => setRoleFilter('MEMBER')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                roleFilter === 'MEMBER'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              Member
            </button>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 px-5 py-4">
        {filteredMembers.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filteredMembers.map((member) => {
              const isCurrentUser = member.id === currentUserId;
              const canManage = isOwner && !isCurrentUser;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {member.avatarUrl ? (
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-skolaroid-blue to-blue-600 text-xs text-white">
                        {getMemberInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {member.name}
                        </span>
                        {member.role === 'OWNER' && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700"
                          >
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                        {member.role === 'ADMIN' && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Joined {formatJoinDate(member.joinedAt)}
                      </span>
                    </div>
                  </div>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {member.role === 'MEMBER' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handlePromoteToAdmin(member.id)}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Promote to Admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {member.role === 'ADMIN' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleRemoveAdmin(member.id)}
                            >
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Remove Admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="mt-3 text-sm font-medium text-gray-900">
              No members found
            </h4>
            <p className="mt-1 text-center text-sm text-gray-600">
              {searchQuery.trim()
                ? `No members match "${searchQuery}"`
                : 'No members with this role'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
