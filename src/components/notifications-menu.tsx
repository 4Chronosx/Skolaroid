'use client';

import { Bell, User, Heart, MessageCircle, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const mockNotifications = [
  {
    id: 1,
    type: 'like',
    message: 'Sarah liked your memory at Engineering Building',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'comment',
    message: 'John commented on your post: "Great photo!"',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'follow',
    message: 'Alex started following you',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'memory',
    message: 'New memory added near your location',
    time: '2 days ago',
    read: true,
  },
];

export function NotificationsMenu() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <User className="h-4 w-4 text-green-500" />;
      case 'memory':
        return <MapPin className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative rounded-full p-2 transition hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)]"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-skolaroid-blue">
              {unreadCount} new
            </span>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto overflow-x-hidden">
          {mockNotifications.length > 0 ? (
            mockNotifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem className="cursor-pointer px-3 py-3">
                  <div className="flex w-full gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words text-sm ${
                          notification.read
                            ? 'text-gray-600'
                            : 'font-medium text-gray-900'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-skolaroid-blue" />
                    )}
                  </div>
                </DropdownMenuItem>
                {index < mockNotifications.length - 1 && (
                  <DropdownMenuSeparator />
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center py-2 text-center text-sm font-medium text-skolaroid-blue hover:text-blue-700">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
