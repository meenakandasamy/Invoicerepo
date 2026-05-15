import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icons: LucideIcon;
  section?: string;
  hidden?: boolean;
  disabled?: boolean;
  activity?: string;
  allowAccess?: boolean;
  mode?: 'menu' | 'settings' | 'both';
};
