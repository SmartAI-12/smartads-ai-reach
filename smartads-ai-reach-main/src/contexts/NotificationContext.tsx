import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications, useCreateNotification, useNotificationSubscription } from '@/hooks/useNotifications';
import { useCreateActivity } from '@/hooks/useActivities';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  createNotification: (params: any) => void;
  logActivity: (params: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: notifications = [] } = useNotifications();
  const createNotificationMutation = useCreateNotification();
  const createActivityMutation = useCreateActivity();
  
  useNotificationSubscription();

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const createNotification = (params: any) => {
    createNotificationMutation.mutate(params);
  };

  const logActivity = (params: any) => {
    createActivityMutation.mutate(params);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      createNotification,
      logActivity,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};