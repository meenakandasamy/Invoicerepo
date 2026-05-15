import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import SidebarItem from './SideBarItem';
import type { NavItem } from '@/types/nav';
import type { LucideIcon } from 'lucide-react';

type SidebarSectionProps = {
    section: string;
    items: Array<NavItem>;
    isExpanded: boolean;
    isCollapsed: boolean;
    toggleSection: (section: string) => void;
    Icon?: LucideIcon;
    sectionLabel: string;
    currentPath: string;
};

export default function SidebarSection({
    section,
    items,
    isExpanded,
    isCollapsed,
    toggleSection,
    Icon,
    sectionLabel,
    currentPath,
}: SidebarSectionProps) {
    // Collapsed Sidebar: Add Tooltip to section icon header
    if (!isExpanded) {
        return (
            <div className="flex flex-col items-center space-y-1 mb-2">
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 ${!isCollapsed ? 'bg-gray-100' : ''}`}
                                onClick={() => toggleSection(section)}
                            >
                                {Icon && <Icon size={22} className="text-gray-700" />}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">{sectionLabel}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {!isCollapsed &&
                    items.map((item, index) => (
                        <SidebarItem
                            key={index}
                            item={item}
                            currentPath={currentPath}
                            isExpanded={false}
                        />
                    ))}
            </div>
        );
    }

    // Expanded Sidebar: Section header with label (tooltip not needed since label visible)
    return (
        <div className="mb-3">
            {/* Section Header */}
            <div
                className="flex items-center justify-between text-xs font-semibold uppercase text-gray-600 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-md"
                onClick={() => toggleSection(section)}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={22} />}
                    <span>{sectionLabel}</span>
                </div>
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </div>

            {/* Sub-items */}
            {!isCollapsed && (
                <ul className="space-y-1 mt-1 ml-2">
                    {items.map((item, index) => (
                        <li key={index}>
                            <SidebarItem
                                item={item}
                                currentPath={currentPath}
                                isExpanded={true}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
