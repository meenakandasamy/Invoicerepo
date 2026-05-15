import React, { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import packageJson from '../../../package.json';
import Footer from './Footer';
import Sidebar from './Sidebar';
import UserOptionsMenu from './helpers/UserOptionsMenu';
import NotificationBell from './helpers/Notification';
import type { JSX } from 'react/jsx-runtime';
import { useSidebar } from '@/hooks/useSideBar';
import CustomBreadcrumbs from '@/utils/common/components/BreadCrumbs';
import { useNavStore } from '@/stores/navItemsStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useQueryFn } from '@/utils/common/queryUtils';
import {
  POInstallmentQuery,
  poInstallmentServices,
} from '@/integrations/Services/poInstallmentServices';
import { ModeToggle } from '@/utils/common/components/ModeToggle';

type LayoutProps = {
  isHidden?: boolean;
  path: string;
  children: React.ReactNode;
};

const closePanel = () => useNotificationStore.getState().setOpen(false);

function generateNotificationsFromInstallments(
  installmentsData: Array<any>,
  router: any,
) {
  const notifications: Array<{
    id: string;
    message: JSX.Element;
    type: string;
    persistent: boolean;
  }> = [];

  installmentsData.forEach((po) => {
    const poNumber = po.poNumber
      ? `PO Number: ${po.poNumber}`
      : `PO ID: ${po.poId}`;
    const vendor = po.vendorName;
    const totalInvoiceValueFormatted = po.totalInvoiceValue?.toLocaleString(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
      },
    );

    for (let i = 1; i <= 6; i++) {
      const overdueDays = po[`overdueDays${i}`];
      const installmentAmount = po[`installment${i}`];
      const status = po[`status${i}`];

      if (status === 6 && overdueDays > 0) {
        notifications.push({
          id: `${po.poInstallmentId}-${i}`,
          message: (
            <>
              <span
                className="text-blue-600 underline cursor-pointer"
                onClick={() => {
                  closePanel();
                  setTimeout(() => {
                    router.navigate({
                      to: '/po/purchaseOrder',
                      search: { poId: po.poId },
                    });
                  }, 50);
                }}
              >
                {poNumber}
              </span>
              {`: Installment ${i} of `}
              <span className="font-semibold text-gray-800 dark:text-[var(--popover-foreground)]">
                {installmentAmount?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }) || 'N/A'}
              </span>
              {` is overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}.`}
              <br />
              Vendor:{' '}
              <span className="font-semibold text-gray-800 dark:text-[var(--popover-foreground)]">
                {vendor || 'N/A'}
              </span>
              <br />
              Total Invoice Value:{' '}
              <span className="font-semibold text-gray-800 dark:text-[var(--popover-foreground)]">
                {totalInvoiceValueFormatted || 'N/A'}
              </span>
            </>
          ),
          type: 'overdue',
          persistent: true,
        });
      }
    }
  });

  return notifications;
}

export function PreloadNotifications({ installmentsData }: any) {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const router = useRouter();

  useEffect(() => {
    if (!installmentsData || installmentsData.length === 0) return;

    const notifications = generateNotificationsFromInstallments(
      installmentsData,
      router,
    );

    notifications.forEach((notification) => {
      addNotification(notification as any);
    });
  }, [addNotification, installmentsData, router]);

  return null;
}

export default function Layout({ isHidden, path, children }: LayoutProps) {
  const { updatedNavItems, sectionAccessMap } = useNavStore(
    (state) => state.navContext,
  );
  const currentPath = path;
  const { isExpanded, toggleSidebar, collapsedSections, toggleSection } =
    useSidebar(updatedNavItems, currentPath);

  // const { data: response } = useQueryFn({
  //   queryKey: POInstallmentQuery.GET_ALL_OVERDUE_LIST + 'NOTIFICATIONS',
  //   api: poInstallmentServices.fetchOverdueInstallments,
  // });

  // Skip layout for login route
  if (
    currentPath.split('/').pop() === 'login' ||
    currentPath.split('/').pop() === 'vendorForm' ||
    currentPath.split('/').pop() === 'expenseForm' ||
    currentPath.split('/').pop() === 'advanceForm'
  ) {
    return (
      <div className="flex-1 overflow-auto">
        {children}
        <Footer companyName="Eira" version={packageJson.version} />
      </div>
    );
  }

  return (
    <>
      {/* Preload persistent notifications only once */}
      {/* <PreloadNotifications
        key={response?.length || 0}
        installmentsData={response}
      /> */}

      <div className={'flex h-screen w-full' + (isHidden ? ' hidden' : '')}>
        <Sidebar
          navItems={updatedNavItems}
          currentPath={currentPath}
          isExpanded={isExpanded}
          toggleSidebar={toggleSidebar}
          collapsedSections={collapsedSections}
          toggleSection={toggleSection}
          isHidden={isHidden}
          accessMap={sectionAccessMap}
        />

        <div className="flex-1 overflow-auto">
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <div
              className="
    h-16 bg-white dark:bg-black shadow-md dark:shadow-lg 
    flex items-center justify-end px-6 border-b border-gray-200 dark:border-[var(--border)] 
    z-10 space-x-4
  "
              style={{ paddingLeft: isExpanded ? '13rem' : '4rem' }}
            >
              <ModeToggle />
              {/* <NotificationBell /> */}
              <UserOptionsMenu />
            </div>

            <div className="flex-1 overflow-auto px-4 pt-4 h-fit">
              <CustomBreadcrumbs />
              <div className="h-[80dvh] flex flex-1 m-2">{children}</div>
              <Footer companyName="Eira" version={packageJson.version} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
