import React, { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { StatusTabs } from './StatusTabs';
import type { HeadCell } from '@/types/table';
import type { RequestData } from '@/types/requestor';
import type { BaseProps } from '@/types/common';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';

function modalContent(
  data: RequestData | undefined,
  comment: string,
  setComment: React.Dispatch<React.SetStateAction<string>>,
) {
  if (!data) return null;

  const fields: Array<{
    label: string;
    value: string | number | null | undefined;
  }> = [
    { label: 'Requestor Name', value: data.requestorName },
    { label: 'Description', value: data.description },
    { label: 'Delivery Address', value: data.deliveryAddress },
    { label: 'Delivery Time', value: data.deliveryTime },
    { label: 'Vendor', value: data.vendorName },
    { label: 'Payment Terms', value: data.paymentTermsName },
    {
      label: 'Taxable Value',
      value: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(data.taxableValue),
    },
    { label: 'Approval Status ID', value: data.approveStatusId },
    { label: 'Approver', value: data.approverName },
    { label: 'Approve 1 Timestamp', value: data.approve1Timestamp },
    { label: 'Approve 1 Comments', value: data.approve1Comments ?? 'N/A' },
    { label: 'Approve 2 Timestamp', value: data.approve2Timestamp ?? 'N/A' },
    { label: 'Approve 2 Comments', value: data.approve2Comments ?? 'N/A' },
    { label: 'Approve 3 Timestamp', value: data.approve3Timestamp ?? 'N/A' },
    { label: 'Approve 3 Comments', value: data.approve3Comments ?? 'N/A' },
  ];

  return (
    <div className="grid grid-cols-1 gap-y-3 text-sm mb-5">
      {fields.map((field, index) => (
        <div key={index} className="flex justify-start gap-2">
          <span className="font-bold text-gray-700">{field.label}:</span>
          <span className="font-semibold text-gray-900">{field.value}</span>
        </div>
      ))}
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
function advanceModalContent(data: any, comment: string, setComment: any) {
  if (!data) return null;

  const fields: Array<{
    label: string;
    value: string | number | null | undefined;
  }> = [
    {
      label: 'Employee Name',
      value: data.employeeName,
    },
    {
      label: 'Employee Id',
      value: data.employeeId,
    },
    {
      label: 'Costing',
      value: data.costing,
    },
    {
      label: 'Description',
      value: data.description,
    },
    {
      label: 'Hub Name',
      value: data.hubName,
    },
    {
      label: 'Site Name',
      value: data.siteId,
    },
    {
      label: 'Site Location',
      value: data.siteLocation,
    },
    {
      label: 'Approver Status',
      value: data.approverStatus,
    },
    { label: 'Approve 1 Timestamp', value: data.approve1Timestamp },
    { label: 'Approve 1 Comments', value: data.approve1Comments ?? 'N/A' },
    { label: 'Approve 2 Timestamp', value: data.approve2Timestamp ?? 'N/A' },
    { label: 'Approve 2 Comments', value: data.approve2Comments ?? 'N/A' },
    { label: 'Approve 3 Timestamp', value: data.approve3Timestamp ?? 'N/A' },
    { label: 'Approve 3 Comments', value: data.approve3Comments ?? 'N/A' },
  ];
  return (
    <div className="grid grid-cols-1 gap-y-3 text-sm mb-5">
      {fields.map((field, index) => (
        <div key={index} className="flex justify-start gap-2">
          <span className="font-bold text-gray-700">{field.label}:</span>
          <span className="font-semibold text-gray-900">{field.value}</span>
        </div>
      ))}
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

interface ApprovalProps extends BaseProps {
  isAdvance: boolean;
  Id?: string | number;
  headCells: Array<HeadCell>;
  allRequests: Array<RequestData | AdvanceRequestFields>;
  handleRequest: (type: string, data: any, comment: any) => void;
}

const ApprovalDashboard = (props: ApprovalProps) => {
  const {
    Id,
    isAdvance,
    hasCreateAccess,
    hasUpdateAccess,
    session,
    headCells,
    allRequests,
    handleRequest,
  } = props;

  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState<RequestData | null>(null);
  const [comment, setComment] = React.useState('');

  const onConfirm = (req: RequestData, type: string, comments: string) => {
    function updateFirstEmptyComment(
      obj: RequestData,
      commentText: string | null = null,
    ): { [key in keyof RequestData]?: string | null } | null {
      const keys: Array<keyof RequestData> = [
        'approve1Comments',
        'approve2Comments',
        'approve3Comments',
      ];

      for (const key of keys) {
        if (obj[key] == null || obj[key] === '') {
          if (commentText !== null) {
            (obj[key] as string | null) = commentText as any;
          }
          return { [key]: obj[key] };
        }
      }
      return null;
    }

    handleRequest(
      type,
      updateFirstEmptyComment(req, comments),
      isAdvance ? req.advApprovalId : req.requestId,
    );
  };

  const handleConfirm = () => {
    if (data && comment) {
      // onConfirm(data, 'APPROVE', comment);
    }
    setComment('');
    setIsOpen(false);
    router.navigate({ to: '/po/approvalDashboard', replace: true });
  };

  const handleClose = () => {
    if (data) {
      onConfirm(data, 'REJECT', comment);
    }
    setIsOpen(false);
    setData(null);
    setComment('');
    router.navigate({ to: '/po/approvalDashboard', replace: true });
  };

  useEffect(() => {
    if (!Id) return;
    setIsOpen(true);
    const res: RequestData = allRequests.find(
      (item) => item.requestId === +Id,
    )!;
    console.log(res, 'res', Id);

    setData(res);
  }, [Id, allRequests]);

  return (
    <div className="w-full h-full flex flex-col">
      <StatusTabs
        headCells={headCells}
        isAdvance={isAdvance}
        key={'statusTabs'}
        statuses={[
          { id: 1, label: 'Pending' },
          { id: 2, label: 'In Progress' },
          { id: 3, label: 'Approved' },
          { id: 4, label: 'Rejected' },
        ]}
        items={allRequests}
        allowOperations={hasUpdateAccess}
        onConfirm={onConfirm}
        userId={session.userId}
        approverId={session.approverId}
      />
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={`Approval Request`}
        description={
          isAdvance
            ? advanceModalContent(data!, comment, setComment)
            : modalContent(data!, comment, setComment)
        }
        confirmButtonText="Approve"
        confirmButtonColor={'green'}
        cancelButtonText="Reject"
        cancelButtonColor={'red'}
        disableConfirmButton={comment === '' || !hasUpdateAccess}
        disableCancelButton={comment === '' || !hasUpdateAccess}
      />
    </div>
  );
};

export default ApprovalDashboard;
