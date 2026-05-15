import { Link } from '@tanstack/react-router';
import type { NavItem } from '@/types/nav';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type SidebarItemProps = {
    item: NavItem;
    currentPath: string;
    isExpanded: boolean;
};

export default function SidebarItem({ item, currentPath, isExpanded }: SidebarItemProps) {
    const currentSegments = currentPath.split('/');
    const targetSegments = item.to.split('/');
    const lastTargetSegment = targetSegments.at(-1);
    const matchIndex = targetSegments.length;

    const isActive =
        currentSegments.at(-1) === lastTargetSegment ||
        currentSegments[matchIndex] === lastTargetSegment;

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        to={item.to}
                        className={`
              flex items-center p-2 rounded-md text-sm transition-colors
              ${isExpanded ? 'justify-start gap-2' : 'justify-center'}
              ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}
            `}
                    >
                        <item.icons size={isExpanded ? 18 : 16} />
                        {isExpanded && <span>{item.label}</span>}
                    </Link>
                </TooltipTrigger>
                {!isExpanded && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
        </TooltipProvider>
    );
}
