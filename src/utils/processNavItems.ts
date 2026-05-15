/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { NavItem } from '@/types/nav';

export function processNavItems(
  navItems: Array<NavItem>,
  session?: Session,
): {
  updatedNavItems: Array<NavItem>;
  sectionAccessMap: Record<string, boolean>;
} {
  const accessMap: Record<string, boolean> = {};
  const sectionItemsMap: Record<string, Array<NavItem>> = {};

  // Safely build activityViewMap only if session data is present and valid
  const activityViewMap: Record<string, number> =
    session?.userMapDetails?.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.activityName] = item.view;
        return acc;
      },
      {},
    ) ?? {};

 const updatedNavItems = navItems
  .map((item) => {
    let allowAccess = false;

    if (item.activity) {
      const view = activityViewMap[item.activity] ?? 0;
      allowAccess = view === 1;
    }

    if (item.section) {
      if (!sectionItemsMap[item.section]) sectionItemsMap[item.section] = [];
      sectionItemsMap[item.section].push({ ...item, allowAccess });
    }

    return { ...item, allowAccess };
  })
  .filter((item) => item.allowAccess); // ✅ ADD THIS LINE

  // Evaluate section-level access
  Object.entries(sectionItemsMap).forEach(([section, items]) => {
    const hasAnyAccess = items.some((item) => item.allowAccess);
    accessMap[section] = hasAnyAccess;
  });

  return {
    updatedNavItems,
    sectionAccessMap: accessMap,
  };
}
