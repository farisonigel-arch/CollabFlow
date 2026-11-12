
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

export type NotificationType = 'Task' | 'Member' | 'Channel' | 'System';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
  taskId?: number;
};

type NewNotification = Omit<NotificationItem, 'read' | 'time'> & {
  time?: string;
};

type NotificationContextType = {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: NewNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearReadNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback(
    (notification: NewNotification) => {
      setNotifications((current) => {
        // Prevent duplicate notification IDs.
        if (current.some((item) => item.id === notification.id)) {
          return current;
        }

        return [
          {
            ...notification,
            time: notification.time ?? new Date().toISOString(),
            read: false,
          },
          ...current,
        ];
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }, []);

  const clearReadNotifications = useCallback(() => {
    setNotifications((current) => current.filter((item) => !item.read));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearReadNotifications,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearReadNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used inside NotificationProvider'
    );
  }

  return context;
}
