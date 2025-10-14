import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Briefcase,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'follow':
      return <UserPlus className="h-5 w-5 text-primary" />;
    case 'like':
      return <Heart className="h-5 w-5 text-destructive" />;
    case 'comment':
      return <MessageCircle className="h-5 w-5 text-primary" />;
    case 'opportunity':
      return <Briefcase className="h-5 w-5 text-primary" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

export default function Notifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Link to="/home">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="rounded-full"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold mb-2">No notifications yet</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                When you get notifications about followers, likes, comments, and
                opportunities, they'll show up here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                to={notification.link || '#'}
                onClick={() => handleNotificationClick(notification)}
                className="block hover:bg-muted/50 transition-colors"
              >
                <div
                  className={cn(
                    "px-4 py-4 flex gap-4 items-start",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
