/* eslint-disable react-hooks/rules-of-hooks */
import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import {
  Building2,
PersonStanding,TicketCheck

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

  // {
  //   to: '/po/loa',
  //   label: 'Vendor Registration',
  //   icons: Building2,
  //   activity: 'ticketConfiguration',
  //   mode: 'menu',
  // },
 
  
  {
    to: '/ticket/config',
    label: 'Ticket Configuration',
    icons: TicketCheck,
    sunlabel:'t-config',
    activity: 'ticketConfiguration',
    mode: 'menu',
  },
   {
    to: '/ticket/Approval',
    label: 'Ticket Approval',
    icons: PersonStanding,
    sunlabel:'T-Approval',
    activity: 'ticketConfiguration',
    mode: 'menu',
  },
    {
    to: '/ticket/sop',
    label: 'Sop',
    icons: Building2,
    sunlabel:'Sop',
    activity: 'ticketConfiguration',
    mode: 'menu',
  },
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
