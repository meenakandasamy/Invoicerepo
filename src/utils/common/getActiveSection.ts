import type { NavItem } from '@/types/nav';

export function getActiveSection(
  navigationItems: Array<NavItem>,
  currentPathString: string,
): { section: string; isActive: boolean } | undefined {
  const currentSegments = currentPathString.split('/');
  for (const item of navigationItems) {
    const targetSegments = item.to.split('/');
    const lastTargetSegment = targetSegments.at(-1);
    const matchIndex = targetSegments.length;

    const isActive =
      currentSegments.at(-1) === lastTargetSegment ||
      currentSegments[matchIndex] === lastTargetSegment;

    if (isActive) return { section: item.section as string, isActive };
  }
}
