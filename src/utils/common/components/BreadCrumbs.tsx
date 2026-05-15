import * as React from 'react';
import { Home } from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function CustomBreadcrumbs() {
  const { location } = useRouterState();
  const path = location.pathname;

  const rawSegments = path.split('/').filter(Boolean);

  // Determine mode (po/admin) based on presence in rawSegments
  const modeSegment = rawSegments.find((seg) => ['po', 'admin'].includes(seg));

  // Filter out , po, and admin from breadcrumb display
  const segments = rawSegments.filter(
    (seg) => seg !== '' && seg !== 'po' && seg !== 'admin',
  );

  const segmentTitleMap: Record<string, string> = {
    approvaldashboard: 'Approval Dashboard',
    approvalDashboard: 'Approval Dashboard',
    vendor: 'Vendors',
    approval: 'Requests',
    requestor: 'Requests',
    purchaseOrder: 'Purchase Orders',
    installment: 'PO Installments',
    product: 'Products',
    paymentTerm: 'Payment Terms',
    role: 'Role',
    approverCreation: 'Approver Configuration',
    approverSiteMap: 'Approver Site Map',
    expenditure: 'Vendor Expenditures',
    expenses: 'Expenses',
    costCentre: 'Cost Centres & Cost Headers',
    loa: 'PO & LOA Upload',
    advance: 'Advance',
    admin: 'Admin',
    advanceApproval: 'Advance Requests',
    warehouse: 'Warehouses',
    warehouseSiteMap: 'Warehouse Site Map',
    inventory: 'Inventories',
    inventoryTransaction: 'Inventory Transactions',
    employeeReimbursement: 'Employee Reimbursement',
    vendorRegistration: 'Vendor Registration',
    consolidatedDashboard: 'Approval Dashboard',
    finalizedPayment: 'Final Payment',
    consultantSalary: 'Consultant Payout',
    reimbursement: 'Employee Reimbursement',
    rent: 'Rent',
    vendor_expenditure: 'Vendor Expenditure',
    employee: 'Employee Expenditure',
    configuration: 'Configuration',
  };

  // Use modeSegment to construct base path
  const basePath = modeSegment ? `//${modeSegment}` : '/';

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home Icon */}
        <BreadcrumbItem>
          <Link to="/">
            <Home size={16} className="inline-block" />
          </Link>
        </BreadcrumbItem>

        {segments.length > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `${basePath}/${segments.slice(0, index + 1).join('/')}`;

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>
                    {segmentTitleMap[segment] || decodeURIComponent(segment)}
                  </BreadcrumbPage>
                ) : (
                  <Link to={href}>
                    {segmentTitleMap[segment] || decodeURIComponent(segment)}
                  </Link>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
