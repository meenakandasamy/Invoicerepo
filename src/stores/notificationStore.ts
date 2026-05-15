import { create } from 'zustand';

type Notification = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'overdue';
  persistent?: boolean;
};

type Store = {
  notifications: Notification[];
  addNotification: (notif: Notification) => void;
  removeNotification: (id: string) => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
};

export const useNotificationStore = create<Store>((set, get) => ({
  notifications: [],
  addNotification: (notif) => {
    const exists = get().notifications.some((n) => n.id === notif.id);
    if (!exists) {
      set((state) => ({ notifications: [...state.notifications, notif] }));
    }
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));