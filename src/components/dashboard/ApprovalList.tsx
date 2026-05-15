import React from 'react';

interface ApprovalListProps {
  requestData: Array<Record<string, any>>;
  style?: React.CSSProperties;
  wrapperClass?: string;
  labelMap?: Record<string, string>;
}

export const ApprovalList = ({
  requestData,
  style,
  wrapperClass = '',
  labelMap = {},
}: ApprovalListProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 ">Approval Stages</h2>
      <div className={`p-4 ${wrapperClass}`}>
        <div
          className="grid gap-4 overflow-y-auto pr-2"
          style={{ maxHeight: 280, ...style }}
        >
          {requestData.map((item, index) => {
            const keys = Object.keys(labelMap).slice(0, 3); // Limit to first 3 mapped fields

            return (
              <div
                key={item.id ?? index}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
              >
                {keys.map((key) => (
                  <div key={key} className="mb-2 text-sm text-gray-700">
                    <span className="font-medium">{labelMap[key]}:</span>{' '}
                    <span>{String(item[key] ?? '')}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
