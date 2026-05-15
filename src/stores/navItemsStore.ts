import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NavItem } from '@/types/nav';
import { processNavItems } from '@/utils/processNavItems';
import { NavItems } from '@/routes/__root';

interface NavStore {
  navContext: {
    updatedNavItems: Array<NavItem>;
    sectionAccessMap: Record<string, boolean>;
  };
  setNavItemsFromSession: (session: Session) => void;
}

function restoreIcons(items: Array<NavItem>): Array<NavItem> {
  const iconMap = new Map(NavItems.map((item) => [item.to, item.icons]));
  return items.map((item) => ({
    ...item,
    icons: iconMap.get(item.to),
  })) as Array<NavItem>;
}

export const useNavStore = create<NavStore>()(
  persist(
    (set) => ({
      navContext: { updatedNavItems: [], sectionAccessMap: {} },
      setNavItemsFromSession: (session) => {
        const processed = processNavItems(NavItems, session);
        set({
          navContext: {
            ...processed,
            updatedNavItems: restoreIcons(processed.updatedNavItems),
          },
        });
      },
    }),
    {
      name: 'nav-store',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          if (!value) return null;

          const parsed = JSON.parse(value);
          // 🛠 Fix icons after reading from storage
          if (parsed?.state?.navContext?.updatedNavItems) {
            parsed.state.navContext.updatedNavItems = restoreIcons(
              parsed.state.navContext.updatedNavItems,
            );
          }
          return parsed;
        },
        setItem: (name, value) => {
          const copy = JSON.parse(JSON.stringify(value));
          if (copy?.state?.navContext?.updatedNavItems) {
            copy.state.navContext.updatedNavItems =
              copy.state.navContext.updatedNavItems.map((item: NavItem) => {
                const { icons, ...rest } = item;
                return rest;
              });
          }
          sessionStorage.setItem(name, JSON.stringify(copy));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    },
  ),
);