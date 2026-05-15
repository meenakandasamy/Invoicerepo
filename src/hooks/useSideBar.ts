import { useEffect, useState } from 'react';
import type { NavItem } from '@/types/nav';
import { getActiveSection } from '@/utils/common/getActiveSection';

export function useSidebar(navItems: Array<NavItem>, currentPath: string) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const activeSection = getActiveSection(navItems, currentPath);
    const defaultState = navItems.reduce(
      (acc, item) => {
        acc[item.section!] = item.section !== activeSection?.section;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setCollapsedSections(defaultState);
  }, [navItems, currentPath]);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const toggleSection = (section: string) =>
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));

  return { isExpanded, toggleSidebar, collapsedSections, toggleSection };
}
