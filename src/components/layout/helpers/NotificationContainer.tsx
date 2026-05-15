// hooks/useNotification.tsx
import { useState, useCallback } from 'react';
import { Notification } from './Notification';

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'overdue';

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  persistent?: boolean;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = useCallback(
    (notif: Omit<NotificationProps, 'id'>) => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, ...notif }]);
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 max-w-sm w-full flex flex-col gap-3 z-[99999] shadow-lg">
      {notifications.map((n) => (
        <Notification
          key={n.id}
          {...n}
          onClose={() => !n.persistent && removeNotification(n.id)}
        />
      ))}
    </div>
  );

  return { addNotification, removeNotification, NotificationContainer };
}
