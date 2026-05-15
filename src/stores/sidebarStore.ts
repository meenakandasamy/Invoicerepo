import { create } from 'zustand';

type SidebarMode = 'menu' | 'settings';

interface SidebarState {
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  mode: 'menu',
  setMode: (mode) => set({ mode }),
}));