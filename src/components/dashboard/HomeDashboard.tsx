import React from 'react';
import { Header } from './Header';
import ApprovalDashboard from './ApprovalDashboard';
import RequestDashboard from './RequestDashboard';

const HomeDashboard = () => {
  const [tab, setTab] = React.useState('approvalDashboard');

  function onTabChange(value: string) {
    setTab(value);
  }

  function onFilterChange() {
    console.log('Filter Change');
  }

  const Dashboard = () => {
    if (tab === 'approvalDashboard') {
      return <ApprovalDashboard />;
    } else if (tab === 'requestDashboard') {
      return <RequestDashboard />;
    }
  };

  return (
    <div className="flex flex-col gap-1 h-full">
      {/* Row 1 */}
      <Header
        onTabChange={onTabChange}
        onFilterChange={onFilterChange}
        tabs={[
          { label: 'Approval', value: 'approvalDashboard' },
          { label: 'Request', value: 'requestDashboard' },
        ]}
        filterFields={[
          { id: 'status', label: 'Status', placeholder: 'Enter status' },
          { id: 'approver', label: 'Approver', placeholder: 'Enter approver' },
        ]}
        hide={{ tab: false, filter: false }}
        filterButtonLabel="Apply"
        tooltipText="Open filters"
      />
      {Dashboard()}
    </div>
  );
};

export default HomeDashboard;
