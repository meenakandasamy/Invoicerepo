import React from 'react';
import {
  Plus,
  UserRound,
  Pause,
  CheckCircle,
  Play,
  XCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';

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
  const text = activity?.toLowerCase();

  // Created
  if (text.includes('created')) {
    return (
      <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
        <Plus size={16} />
      </div>
    );
  }

  // Assigned / Reassigned
  if (
    text.includes('assigned') ||
    text.includes('re-assigned')
  ) {
    return (
      <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
        <UserRound size={16} />
      </div>
    );
  }

  // Hold
  if (text.includes('hold')) {
    return (
      <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
        <Pause size={16} />
      </div>
    );
  }

  // Closed
  if (text.includes('closed')) {
    return (
      <div className="bg-green-100 text-green-600 p-2 rounded-full">
        <CheckCircle size={16} />
      </div>
    );
  }

  // In Progress
  if (
    text.includes('progress') ||
    text.includes('started')
  ) {
    return (
      <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
        <Play size={16} />
      </div>
    );
  }

  // Reopened
  if (text.includes('reopen')) {
    return (
      <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
        <RotateCcw size={16} />
      </div>
    );
  }

  // Cancelled / Rejected
  if (
    text.includes('cancel') ||
    text.includes('reject')
  ) {
    return (
      <div className="bg-red-100 text-red-600 p-2 rounded-full">
        <XCircle size={16} />
      </div>
    );
  }

  // Pending
  if (text.includes('pending')) {
    return (
      <div className="bg-cyan-100 text-cyan-600 p-2 rounded-full">
        <Clock size={16} />
      </div>
    );
  }

  // Default
  return (
    <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
      <Clock size={16} />
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