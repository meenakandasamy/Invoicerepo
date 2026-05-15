import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';

export default function NotificationBell() {
  const { notifications, removeNotification } = useNotificationStore();
  const unreadCount = notifications.length;

  const typeStyles = {
    overdue: 'bg-orange-500',
    success: 'bg-blue-500',
    warning: 'bg-orange-400',
    info: 'bg-blue-400',
    danger: 'bg-red-600', 
  } as const;

  const typeIcons = {
    overdue: <AlertTriangle className="w-10 h-10 text-orange-500" />,
    success: <CheckCircle className="w-4 h-4 text-blue-500" />,
   warning: <AlertTriangle className="w-6 h-6 text-orange-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
    danger: <AlertTriangle className="w-4 h-4 text-red-600" />, 
  } as const;

  const getTypeIcon = (type: keyof typeof typeIcons) =>
    typeIcons[type] || <Info className="w-4 h-4 text-gray-400" />;

  const getTypeStyle = (type: keyof typeof typeStyles) =>
    typeStyles[type] || 'bg-gray-400';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-md transition-colors focus:ring-0 focus:border-none"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-[var(--foreground)] hover:text-orange-500 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[999999] overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 dark:scrollbar-thumb-orange-600"
      >
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className="group relative flex items-start gap-3 px-2 py-3 text-sm transition-colors hover:bg-orange-50 dark:hover:bg-gray-800"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getTypeStyle(n.type)} rounded-l-md`} />
                <div className="flex items-start gap-2 pl-2">
                  {getTypeIcon(n.type)}
                  <span className="text-gray-800 dark:text-gray-200">
                    {n.message}
                  </span>
                </div>
                {!n.persistent && (
                  <button
                    className="ml-auto text-gray-300 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeNotification(n.id)}
                  >
                    <X size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}