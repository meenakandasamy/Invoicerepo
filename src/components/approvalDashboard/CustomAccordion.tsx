import { format } from 'date-fns';
import React from 'react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import type { RequestData } from '@/types/requestor';
import type { HeadCell } from '@/types/table';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';

export function CustomAccordion({
  isAdvance,
  // userId,
  headCells,
  data,
  onConfirm,
  orientation = 'vertical',
  approverId,
  disabled,
}: {
  data: RequestData;
  headCells: Array<HeadCell>;
  userId?: number | string;
  isAdvance: boolean;
  onConfirm: (data: RequestData, type: string, comment: string) => void;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  approverId: number | string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [type, setType] = React.useState('APPROVE');
  const [comment, setComment] = React.useState('');

  const handleConfirm = () => {
    if (comment) {
      onConfirm(data, type, comment);
      setComment('');
      setIsOpen(false);
    } else {
      toast.error('Please enter a comment!');
    }
  };

  const handleClose = () => setIsOpen(false);

  const CanAccessButtons =
    ![3, 4].includes(
      isAdvance ? data.approverStatusId : data.approveStatusId,
    ) && approverId === data.levelId;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-4xl mx-auto my-4 border">
      <Accordion type="single" collapsible>
        <AccordionItem value={`item-${data.requestId}`}>
          <AccordionTrigger>
            <div
              className={`w-full text-left text-sm ${
                orientation === 'horizontal'
                  ? 'flex flex-wrap gap-4'
                  : 'grid grid-cols-1 sm:grid-cols-4 gap-2'
              }`}
            >
              {headCells.map((headCell, index) => (
                <span
                  key={index}
                  style={{
                    color:
                      headCell.id === 'approveStatusId' ||
                      headCell.id === 'approverStatusId'
                        ? getStatusColor(data[headCell.id])
                        : 'black',
                  }}
                >
                  <strong>{headCell.label}:</strong>{' '}
                  {headCell.id === 'approveStatusId' ||
                  headCell.id === 'approverStatusId'
                    ? getStatusText(data[headCell.id])
                    : data[headCell.id as keyof RequestData]}
                </span>
              ))}
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="space-y-4">
              <ApprovalBlock
                level={1}
                name={data.approverName}
                timestamp={data.approve1Timestamp}
                comments={data.approve1Comments}
              />
              {data.approve2Comments && (
                <ApprovalBlock
                  level={2}
                  name={data.approverName}
                  timestamp={data.approve2Timestamp}
                  comments={data.approve2Comments}
                />
              )}
              {data.approve3Comments && (
                <ApprovalBlock
                  level={3}
                  name={data.approverName}
                  timestamp={data.approve3Timestamp}
                  comments={data.approve3Comments}
                />
              )}

              {CanAccessButtons && (
                <div className="flex gap-2">
                  <Button
                    className="hover:bg-green-700 bg-green-500 cursor-pointer"
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setType('APPROVE');
                      setIsOpen(true);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    className="hover:bg-red-700 bg-red-500 cursor-pointer"
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setType('REJECT');
                      setIsOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={`${type === 'APPROVE' ? 'Approve' : 'Reject'} Request`}
        description={modalContent(headCells, data, type, comment, setComment)}
        confirmButtonText="Confirm"
        confirmButtonColor={'green'}
        cancelButtonText="Cancel"
        cancelButtonColor={'red'}
      />
    </div>
  );
}

function ApprovalBlock({
  level,
  name,
  timestamp,
  comments,
}: {
  level: number;
  name: string;
  timestamp: string | null;
  comments: string | null;
}) {
  return (
    <div className="border rounded p-3">
      <p>
        <strong>Level {level} Approver:</strong> {name}
      </p>
      <p>
        <strong>Timestamp:</strong>{' '}
        {timestamp ? format(new Date(timestamp), 'PPpp') : 'N/A'}
      </p>
      <p>
        <strong>Comments:</strong> {comments || 'No comments'}
      </p>
    </div>
  );
}

function getStatusText(statusId: number): string {
  const statusMap: Record<number, string> = {
    1: 'Pending',
    2: 'Under Review',
    3: 'Approved',
    4: 'Rejected',
  };
  return statusMap[statusId] || 'Unknown';
}

function getStatusColor(statusId: number): string {
  const statusMap: Record<number, string> = {
    1: 'blue',
    2: 'orange',
    3: 'green',
    4: 'red',
  };
  return statusMap[statusId] || 'gray';
}

function modalContent(
  headCells: Array<HeadCell>,
  data: RequestData,
  type: string,
  comment: string,
  setComment: (value: string) => void,
) {
  return (
    <div className="text-sm space-y-2 mb-5">
      <p>
        Are you sure you want to{' '}
        <strong
          className={type === 'APPROVE' ? 'text-green-600' : 'text-red-600'}
        >
          {type.toLowerCase()}
        </strong>{' '}
        the request from <strong>{data.requestorName}</strong>?
      </p>
      <div className="flex justify-center mt-2 mb-2">
        <div className="flex flex-col text-left gap-0.5">
          {headCells
            .filter(
              (headCell) => headCell.view && headCell.sortable !== undefined,
            )
            .sort((a, b) => a.sortable! - b.sortable!)
            .map((headCell) => (
              <p key={headCell.id}>
                <strong>{headCell.label}:</strong>{' '}
                {headCell.id === 'costing' || headCell.id === 'taxableValue'
                  ? data[headCell.id]?.toLocaleString()
                  : data[headCell.id as keyof RequestData]}
              </p>
            ))}
        </div>
      </div>

      {/* <p>
        <strong>Description:</strong> {data.description}
      </p>
      <p>
        <strong>Vendor:</strong> {data.vendorName}
      </p>
      <p>
        <strong>Taxable Value:</strong> ₹
        {isAdvance
          ? data.costing.toLocaleString()
          : data.taxableValue.toLocaleString()}
      </p> */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
          rows={3}
          placeholder="Enter your comment here"
        />
      </div>
    </div>
  );
}
