import { Filter } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CustomTooltip from '@/utils/common/components/CustomTooltip';
import { CustomPopover } from '@/utils/common/components/CustomPopover';

interface TabItem {
  label: string;
  value: string;
}

interface FilterField {
  id: string;
  label: string;
  placeholder: string;
}

interface HeaderProps {
  onTabChange?: (value: string) => void;
  onFilterChange?: () => void;
  tabs?: Array<TabItem>;
  filterFields?: Array<FilterField>;
  filterButtonLabel?: string;
  tooltipText?: string;
  disabled?: { tab?: boolean; filter?: boolean };
  hide?: { tab?: boolean; filter?: boolean };
}

export const Header = ({
  onTabChange = () => {},
  onFilterChange = () => {},
  tabs = [],
  filterFields = [],
  filterButtonLabel = 'Apply Filters',
  tooltipText = 'Filter',
  disabled = {},
  hide = { tab: false, filter: false },
}: HeaderProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleApplyFilters = () => {
    if (!disabled.filter) {
      onFilterChange();
      setPopoverOpen(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <Tabs
          className={`cursor-pointer ${disabled.tab ? 'opacity-50 pointer-events-none' : ''} ${hide.tab ? 'hidden' : ''}`}
          defaultValue={tabs[0]?.value}
          onValueChange={onTabChange}
        >
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="cursor-pointer"
                disabled={disabled.tab}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <CustomPopover
        open={popoverOpen}
        onOpenChange={(open) => !disabled.filter && setPopoverOpen(open)}
        trigger={
          <div>
            <CustomTooltip content={<p>{tooltipText}</p>}>
              <Button
                className={`cursor-pointer ${disabled.filter ? 'opacity-50 pointer-events-none' : ''} ${hide.filter ? 'hidden' : ''}`}
                variant="ghost"
                size="icon"
                disabled={disabled.filter}
              >
                <Filter />
              </Button>
            </CustomTooltip>
          </div>
        }
        side="right"
        align="start"
      >
        <div className="space-y-4 w-[280px] max-w-full overflow-x-hidden">
          {filterFields.map((field) => (
            <div className="w-full" key={field.id}>
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                placeholder={field.placeholder}
                className="w-full"
                disabled={disabled.filter}
              />
            </div>
          ))}
          <Button
            className="w-full"
            onClick={handleApplyFilters}
            disabled={disabled.filter}
          >
            {filterButtonLabel}
          </Button>
        </div>
      </CustomPopover>
    </div>
  );
};
