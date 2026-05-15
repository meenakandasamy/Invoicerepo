import { Settings, Menu, ShoppingCart } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger  } from '@radix-ui/react-tooltip';

interface MenuToggleProps {
  variant?: 'icon' | 'text' | 'both';
  className?: string;
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
}

export const MenuToggle = ({
  variant = 'both',
  className = '',
  tooltipPosition = 'right',
}: MenuToggleProps) => {
  const { mode, setMode } = useSidebarStore();
  
  const toggleMode = () => setMode(mode === 'menu' ? 'settings' : 'menu');
  const isSettingsMode = mode === 'settings';
  const label = isSettingsMode ? 'Switch to Menu' : 'Switch to Settings';

  const renderContent = () => {
    switch (variant) {
      case 'icon':
        return isSettingsMode ? <Menu size={20} /> : <Settings size={20} />;
      case 'text':
        return <span>{label}</span>;
      default:
        return (
          <>
            {isSettingsMode ? <Menu size={20} /> : <Settings size={20} />}
            <span>{label}</span>
          </>
        );
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleMode}
            className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors ${className}`}
            aria-label={label}
          >
            {renderContent()}
          </button>
        </TooltipTrigger>
        <TooltipContent side={tooltipPosition}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};