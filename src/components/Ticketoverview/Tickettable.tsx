import React from 'react';
import { Plus, UserRound, Play } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';

import { Card, CardContent } from '@/components/ui/card';

interface TicketActivityTableProps {
  ticketHistory: any[];
}

function TicketActivityTable({
  ticketHistory,
}: TicketActivityTableProps) {
  const getIcon = (activity: string) => {
    if (activity?.toLowerCase().includes('created')) {
      return (
        <div className="bg-blue-500 p-2 rounded-full text-white">
          <Plus size={14} />
        </div>
      );
    }

    if (activity?.toLowerCase().includes('assigned')) {
      return (
        <div className="bg-orange-500 p-2 rounded-full text-white">
          <UserRound size={14} />
        </div>
      );
    }

    return (
      <div className="bg-green-500 p-2 rounded-full text-white">
        <Play size={14} />
      </div>
    );
  };

  return (
    <Card className="py-2 mt-4">
      <CardContent className="w-full py-2">
        <div>
          <Table className="w-full">
            {/* Header same as parent */}
            <TableHeader className="dark:bg-violet-100 dark:text-secondary-foreground bg-muted/40">
              <TableRow>
                <TableCell className="font-semibold text-sm">
                  S.NO
                </TableCell>

                <TableCell className="font-semibold text-sm">
                  Activity
                </TableCell>

                <TableCell className="font-semibold text-sm">
                    Remarks
                </TableCell>

                <TableCell className="font-semibold text-sm">
                  Last Acted By
                </TableCell>

                <TableCell className="font-semibold text-sm">
                    Last Acted On
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white dark:bg-background">
              {ticketHistory?.length > 0 ? (
                ticketHistory.map((item, index) => {
                  const activityText =
                    item.description ===
                    'Ticket has been Created'
                      ? item.description
                      : `${item.description} - ${item.assignedBy}`;

                  return (
                    <TableRow
                      key={index}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-sm">
                        {index + 1}
                      </TableCell>

                      <TableCell className="text-sm">
                        <div className="flex items-center gap-3">
                          {getIcon(activityText)}

                          <span className="font-medium">
                            {activityText}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {item?.remarks || '-'}
                      </TableCell>

                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-semibold">
                            {item?.userName?.charAt(0)}
                          </div>

                          <span>
                            {item?.userName || '-'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {item?.ticketStatusId === 5
                          ? item?.completedTimestamp
                          : item?.createdDate||'-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-40 text-muted-foreground"
                  >
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default TicketActivityTable;