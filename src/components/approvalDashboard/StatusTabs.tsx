import { useState } from 'react';
import { CustomAccordion } from './CustomAccordion';
import type { RequestData } from '@/types/requestor';
import type { HeadCell } from '@/types/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatusColor = (id: number) => {
  switch (id) {
    case 1:
      return 'bg-yellow-50';
    case 2:
      return 'bg-blue-50';
    case 3:
      return 'bg-green-50';
    case 4:
      return 'bg-red-50';
    default:
      return 'bg-white';
  }
};

interface StatusTabsProps {
  isAdvance: boolean;
  headCells: Array<HeadCell>;
  statuses: Array<{ id: number; label: string }>;
  items: Array<RequestData>;
  onConfirm: (data: RequestData, type: string, comment: string) => void;
  approverId: number | string;
  userId: number | string;
  allowOperations: boolean;
}

export const StatusTabs = ({
  headCells,
  statuses,
  isAdvance,
  items,
  onConfirm,
  userId,
  approverId,
  allowOperations,
}: StatusTabsProps) => {
  const [activeStatusId, setActiveStatusId] = useState<number>(
    statuses[0]?.id ?? 0,
  );

  const filteredItems = items.filter((item) =>
    isAdvance
      ? +item.approverStatusId === activeStatusId
      : +item.approveStatusId === activeStatusId,
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab triggers */}
      <Tabs defaultValue={statuses[0]?.id.toString()}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-0">
          {statuses.map((status) => {
            const count = items.filter((item) =>
              isAdvance
                ? +item.approverStatusId === +status.id
                : +item.approveStatusId === +status.id,
            ).length;

            return (
              <TabsTrigger
                key={status.id}
                value={status.id.toString()}
                onClick={() => setActiveStatusId(status.id)}
                className={`cursor-pointer ${
                  activeStatusId === status.id ? 'bg-gray-200' : ''
                } `}
              >
                {status.label}
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-black ml-2">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Content for active tab */}
      <div className="flex-1 overflow-hidden mt-2">
        <div
          className={`border rounded-lg shadow-sm flex flex-col h-full ${getStatusColor(
            activeStatusId,
          )}`}
        >
          {/* Header section */}
          <div className="p-4 shrink-0">
            <h2 className="text-center font-bold text-sm mb-2">
              {statuses.find((s) => s.id === activeStatusId)?.label}
            </h2>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredItems.length > 0 ? (
              <div className="flex flex-wrap -mx-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.requestId}
                    className="w-full md:w-1/2 px-2 mb-4"
                  >
                    <CustomAccordion
                      headCells={headCells}
                      isAdvance={isAdvance}
                      data={item}
                      onConfirm={onConfirm}
                      userId={userId}
                      approverId={approverId}
                      disabled={!allowOperations}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                No requests
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
