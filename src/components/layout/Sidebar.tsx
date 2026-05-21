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
    className={`
      h-screen transition-all duration-300 z-30
      ${isExpanded ? 'w-[260px]' : 'w-[88px]'}
      bg-white border-r border-slate-200
      flex flex-col
      shadow-sm
      overflow-hidden
    `}
  >
    {/* Header */}
    <div className="h-[65px] border-b border-slate-200 flex items-center ">
      {isExpanded ? (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-violet-100 flex items-center justify-center">
            <img
              src={LogoSrc}
              alt="logo"
              className="w-7 h-7 object-contain"
            />
          </div>

          <div>
            <h2 className="text-[20px] font-semibold text-slate-800">
              Eira Ticketing
            </h2>

           
          </div>
        </div>
      ) : (
        <button
          className="
            mx-auto h-10 w-10 rounded-xl
            hover:bg-slate-100
            flex items-center justify-center
            transition
          "
        >
          <Menu size={20} className="text-slate-700" />
        </button>
      )}
    </div>

    {/* Menu */}
    <div className="flex-1 overflow-y-auto px-3 py-5 custom-scrollbar">
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
            <div key={'sec-wrap-' + section} className="mb-3">
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
            </div>
          );
        }

        // ---------------- UNGROUPED ITEM ----------------
        const item = entry.item;

        if (item.allowAccess === false) return null;

        const currentSegments = currentPath.split('/');
        const lastSegment = item.to.split('/').at(-1);

        const isActive =
          currentSegments.at(-1) === lastSegment;

        return (
          <div key={'item-' + idx} className="mb-2">
            <Tooltip>
              <Link to={item.to}>
                <div
                  className={`
                    group relative flex items-center
                    rounded-2xl px-4 py-3
                    transition-all duration-200 cursor-pointer

                    ${
                      isExpanded
                        ? 'gap-3'
                        : 'justify-center'
                    }

                    ${
                      isActive
                        ? `
                          bg-violet-100
                          text-violet-700
                          shadow-sm
                        `
                        : `
                          text-slate-600
                          hover:bg-slate-100
                          hover:text-slate-900
                        `
                    }
                  `}
                >
                  {/* Active Left Border */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-violet-600" />
                  )}

                  <item.icons
                    size={20}
                    className={`
                      shrink-0
                      ${
                        isActive
                          ? 'text-violet-700'
                          : 'text-slate-500 group-hover:text-slate-800'
                      }
                    `}
                  />

                  {isExpanded && (
                    <span className="font-medium text-[14px] truncate">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>

              {!isExpanded && (
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        );
      })}
    </div>
   
  </div>
);
}
