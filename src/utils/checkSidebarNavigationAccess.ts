import { redirect } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { navItem } from '@/types/nav';

export interface SidebarNavigationAccessParams {
  mode: string;
  currentPath: string;
  rawBasePath: string;
  normalizedGlobalBasePath: string;
  navItems: Array<navItem>;
}

const normalizePath = (path: string) => {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
};

export function checkSidebarNavigationAccess({
  mode,
  currentPath,
  rawBasePath,
  normalizedGlobalBasePath,
  navItems,
}: SidebarNavigationAccessParams) {
  const allowedSettingsPaths = [
    normalizedGlobalBasePath,
    normalizePath(`${normalizedGlobalBasePath}/po/admin/role`),
  ];

  const allowedMenuPaths = new Set(
    navItems
      .filter((item) => item.mode === 'menu' || item.mode === 'both')
      .map((item) =>
        normalizePath(
          `${normalizedGlobalBasePath === '/' ? '' : normalizedGlobalBasePath}${item.to}`
        )
      )
  );

  allowedMenuPaths.add(normalizePath(`${normalizedGlobalBasePath}/login`));
  allowedMenuPaths.add(normalizePath(`${normalizedGlobalBasePath}/config`));
  allowedMenuPaths.add(normalizePath(`${normalizedGlobalBasePath}/po/approvaldashboard`));
  allowedMenuPaths.add(normalizedGlobalBasePath);

  const isAllowedInSettingsMode = allowedSettingsPaths.includes(currentPath);
  const isAllowedInMenuMode = allowedMenuPaths.has(currentPath);

  console.log('--- Sidebar Navigation Guard ---');
  console.log('Mode:', mode);
  console.log('Current Path:', currentPath);
  console.log('Allowed Settings Paths:', allowedSettingsPaths);
  console.log('Allowed Menu Paths:', Array.from(allowedMenuPaths));
  console.log('Is Allowed in Settings Mode:', isAllowedInSettingsMode);
  console.log('Is Allowed in Menu Mode:', isAllowedInMenuMode);

  if (mode === 'settings') {
    if (!isAllowedInSettingsMode) {
      toast.info('Please exit Admin mode to access this page');
      throw redirect({ to: normalizePath(`${normalizedGlobalBasePath}/po/admin/role`), replace: true });
    }
  } else if (mode === 'menu') {
    if (!isAllowedInMenuMode) {
      toast.info('Please use Admin mode to access this page');
      throw redirect({ to: `${rawBasePath}/`, replace: true });
    }
  }
}
