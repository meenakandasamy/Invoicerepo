import { useEffect, useRef } from 'react';
import {
  BadgeIndianRupee,
  BookPlus,
  Home,
  IdCardLanyard,
  Menu,
  NotebookTabs,
  Settings,
  SettingsIcon,
  ShieldUser,
  Store,
 
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import LogoSrc from '../../assets/images/eiraimage.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import SidebarSection from './helpers/SideBarSection';
import type { LucideIcon } from 'lucide-react';
import type { NavItem } from '@/types/nav';
import { useSidebarStore } from '@/stores/sidebarStore';

const sectionMeta: Record<string, { icon?: LucideIcon; label?: string }> = {
  home: { icon: Home, label: 'Home' },
  'Procurement Flow': { icon: BookPlus, label: 'Procurement Flow' },
  'Vendor Expenditure': { icon: Store, label: 'Vendor Expenditure' },
  'Employee Expenditure': {
    icon: IdCardLanyard,
    label: 'Employee Expenditure',
  },
  'User Configuration': {
    icon: ShieldUser,
    label: 'User Configuration',
  },
  'PO Configuration': { icon: ShieldUser, label: 'PO Configuration' },
  Configuration: { icon: SettingsIcon, label: 'Configuration' },
  'Advance Flow': { icon: BadgeIndianRupee, label: 'Advance Flow' },
  'Inventory Management': { icon: NotebookTabs, label: 'Inventory Management' },
  Settings: { icon: Settings, label: 'Settings' },
};

type SidebarProps = {
  navItems: Array<NavItem>;
  currentPath: string;
  isExpanded: boolean;
  toggleSidebar: () => void;
  collapsedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  isHidden?: boolean;
  accessMap?: Record<string, boolean>;
};

export default function Sidebar({
  navItems,
  currentPath,
  isExpanded,
  toggleSidebar,
  collapsedSections,
  toggleSection,
  isHidden,
  accessMap,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { mode, setMode } = useSidebarStore();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Mode filtering
  console.log(navItems);
  
  const filteredNavItems = navItems.filter((item) => {
    if (!item.mode) return true;
    return item.mode === mode || item.mode === 'both';
  });
  console.log(filteredNavItems);
  // ------------------------------
  // Build ordered structure:
  // - Add section header once
  // - Add items ONLY if ungrouped
  // ------------------------------
  const finalRenderList: Array<
    { type: 'section'; name: string } | { type: 'ungrouped'; item: NavItem }
  > = [];

  const sectionMap: Record<string, Array<NavItem>> = {};
  const sectionAdded = new Set<string>();

  filteredNavItems.forEach((item) => {
    if (item.section) {
      // Initialize section bucket
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!sectionMap[item.section]) sectionMap[item.section] = [];

      sectionMap[item.section].push(item);

      // Add section header ONCE in order
      if (!sectionAdded.has(item.section)) {
        finalRenderList.push({ type: 'section', name: item.section });
        sectionAdded.add(item.section);
      }
    } else {
      // Ungrouped item → Add directly where it appears
      finalRenderList.push({ type: 'ungrouped', item });
    }
  });

  if (isHidden) return null;

  return (
    <div
      ref={sidebarRef}
      onMouseEnter={() => !isExpanded && toggleSidebar()}
      onMouseLeave={() => isExpanded && toggleSidebar()}
      className={`h-screen bg-white dark:bg-black text-sidebar-foreground
    shadow-sm transition-all duration-300 z-30
    ${isExpanded ? 'w-52 border-r border-sidebar-border' : 'w-16'}`}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        {isExpanded ? (
          <div className="flex justify-center w-full">
            <img src={LogoSrc} alt="Eira" className="w-10" />
          </div>
        ) : (
          <Menu size={24} className="text-sidebar-foreground" />
        )}
      </div>

      {/* Scroll */}
      <div className="px-2 pb-4 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
        {finalRenderList.map((entry, idx) => {
          // ---------------- SECTION ----------------
          if (entry.type === 'section') {
            const section = entry.name;

            if (accessMap && accessMap[section] === false) return null;

            const items = sectionMap[section].filter(
              (i) => i.allowAccess !== false,
            );
            if (items.length === 0) return null;

            const meta = sectionMeta[section] ?? {};
            const Icon = meta.icon;
            const label = meta.label || section;

            return (
              <SidebarSection
                key={'sec-' + section}
                section={section}
                items={items}
                isExpanded={isExpanded}
                isCollapsed={collapsedSections[section]}
                toggleSection={toggleSection}
                Icon={Icon}
                sectionLabel={label}
                currentPath={currentPath}
              />
            );
          }

          // ---------------- UNGROUPED ITEM ----------------
          const item = entry.item;
          if (item.allowAccess === false) return null;

          const currentSegments = currentPath.split('/');
          const lastSegment = item.to.split('/').at(-1);
          const isActive = currentSegments.at(-1) === lastSegment;

          return (
            <div
              key={'item-' + idx}
              className={`mb-4 ${isExpanded ? 'ml-2' : ''}`}
            >
              {/* <TooltipProvider delayDuration={200}> */}
                 <Tooltip>
                  {/* <TooltipTrigger asChild> */}
                    <Link to={item.to}>
                      <div
                        className={`
                          flex items-center rounded-md text-sm transition-colors
                          ${isExpanded ? 'justify-start gap-2' : 'justify-center'}
                          ${isActive ? 'text-primary' : 'text-muted-foreground'}
                          ${!isActive ? 'hover:bg-muted' : ''}
                        `}
                      >
                        <item.icons size={22} />
                        {isExpanded && <span>{item.label}</span>}
                      </div>
                    </Link>
                  {/* </TooltipTrigger> */}

                  {!isExpanded && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              {/* </TooltipProvider> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
