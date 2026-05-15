/* eslint-disable react-hooks/rules-of-hooks */
import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import {
  Banknote,
  BanknoteArrowDown,
  BanknoteArrowUp,
  BookOpenCheck,
  Building2,
  FileCheck,
  HandCoins,
  Home,
  Hotel,
  MapPinCheck,
  Monitor,
  ShieldUser,
  ShoppingCart,
  User,
  UserCog,
  Users,
} from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import TanstackQueryLayout from '../integrations/tanstack-query/layout';
import internalSession from '../../session.json';
import type { QueryClient } from '@tanstack/react-query';
import type { NavItem } from '@/types/nav';
import { Toaster } from '@/components/form/toast';
import Layout from '@/components/layout/NavLayout';
import { useRestoreSession } from '@/hooks/useSessionRestore';
import { SetSessionCookie } from '@/utils/common/cookieHandler';
import { altSession } from '@/utils/common/sessionAltWay';

interface AppRouterContext {
  queryClient: QueryClient;
  session: Session;
}

export const NavItems: Array<NavItem> = [

  {
    to: '/po/vendor',
    label: 'Vendor Registration',
    icons: Building2,
    activity: 'vendors',
    mode: 'menu',
  },
    {
    to: '/invoice/purchaseorder',
    label: 'Purchase Order',
    icons: HandCoins,
    activity: 'purchaseorders',
    mode: 'menu',
  }
  // {
  //   to: '/vendor_expenditure/expenses',
  //   label: 'Expenses',
  //   icons: HandCoins,
  //   section: 'Vendor Expenditure',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/vendor_expenditure/advance',
  //   label: 'Advance',
  //   icons: BanknoteArrowDown,
  //   section: 'Vendor Expenditure',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/vendor_expenditure/rent',
  //   label: 'Rent',
  //   icons: Hotel,
  //   section: 'Vendor Expenditure',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/employee/reimbursement',
  //   label: 'Reimbursement',
  //   icons: BanknoteArrowUp,
  //   section: 'Employee Expenditure',
  //   activity: 'approvalDashboard',
  //   mode: 'menu',
  // },
  // {
  //   to: '/employee/consultantSalary',
  //   label: 'Consultant Payout',
  //   icons: Banknote,
  //   section: 'Employee Expenditure',
  //   activity: 'approvalDashboard',
  //   mode: 'menu',
  // },
  // {
  //   to: '/configuration/approverCreation',
  //   label: 'Approver Configuration',
  //   icons: ShieldUser,
  //   section: 'Configuration',
  //   activity: 'approverConfiguration',
  //   mode: 'menu',
  // },
  // {
  //   to: '/configuration/costCentre',
  //   label: 'Cost Centres & Cost Headers',
  //   icons: MapPinCheck,
  //   section: 'Configuration',
  //   activity: 'approvalMapping',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/consolidatedDashboard',
  //   label: 'Approval Dashboard',
  //   icons: Monitor,
  //   activity: 'approvalDashboard',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/finalizedPayment',
  //   label: 'Final Payment',
  //   icons: BookOpenCheck,
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/requestor',
  //   label: 'Requests',
  //   icons: BookPlus,
  //   activity: 'requestor',
  //   section: 'Procurement Flow',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/approvaldashboard',
  //   label: 'Approval Dashboard',
  //   activity: 'approvalDashboard',
  //   icons: BookCheck,
  //   section: 'Procurement Flow',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/purchaseOrder',
  //   label: 'Purchase Orders',
  //   icons: DollarSign,
  //   section: 'Procurement Flow',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/installment',
  //   label: 'PO Installments',
  //   icons: HandCoins,
  //   section: 'Procurement Flow',
  //   activity: 'poInstallment',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/product',
  //   label: 'Products',
  //   icons: ShoppingCart,
  //   section: 'Procurement Flow',
  //   activity: 'vendorProduct',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/paymentTerm',
  //   label: 'Payment Terms',
  //   icons: Handshake,
  //   section: 'Procurement Flow',
  //   activity: 'paymentTerms',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/approverSiteMap',
  //   label: 'Approver Site Map',
  //   icons: MapPinCheck,
  //   section: 'PO Configuration',
  //   activity: 'approvalMapping',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/advanceApproval',
  //   label: 'Advance Request',
  //   icons: Wallet,
  //   section: 'Advance Flow',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/approvalDashboard/advance',
  //   label: 'Advance Approval Dashboard',
  //   icons: BookOpenCheck,
  //   section: 'Advance Flow',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/warehouse',
  //   label: 'Warehouse',
  //   icons: Warehouse,
  //   section: 'Inventory Management',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/warehouseSiteMap',
  //   label: 'Warehouse Site Map',
  //   icons: MapPinHouse,
  //   section: 'Inventory Management',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },

  // {
  //   to: '/po/inventory',
  //   label: 'Inventory',
  //   icons: ShoppingBasket,
  //   section: 'Inventory Management',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/inventoryTransaction',
  //   label: 'Inventory Transaction',
  //   icons: ArrowRightLeft,
  //   section: 'Inventory Management',
  //   activity: 'purchaseOrder',
  //   mode: 'menu',
  // },
  // {
  //   to: '/po/role',
  //   label: 'Role',
  //   icons: Handshake,
  //   activity: 'userRole',
  //   mode: 'settings',
  // },
];

export const Route = createRootRouteWithContext<AppRouterContext>()({
  beforeLoad() {
    const devFn = altSession();
    const session = sessionStorage.getItem('session')
      ? JSON.parse(sessionStorage.getItem('session')!)
      : devFn
        ? internalSession
        : null;
    if (!session) return;
    sessionStorage.setItem('session', JSON.stringify(session));
    SetSessionCookie(session);
    return;
  },
  component: () => {
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    useRestoreSession();

    return (
      <div className="flex h-dvh w-full">
        <Layout path={currentPath}>
          <div className="flex flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPath}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full flex flex-1"
              >
                <div className="w-full">
                  <Outlet />
                </div>
              </motion.div>
            </AnimatePresence>
            <Toaster richColors closeButton />
            <TanStackRouterDevtools />
            <TanstackQueryLayout />
          </div>
        </Layout>
      </div>
    );
  },
});
