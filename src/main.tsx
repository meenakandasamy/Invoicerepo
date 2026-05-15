import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createHashHistory, createRouter } from '@tanstack/react-router';
import * as TanstackQuery from './integrations/tanstack-query/root-provider';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

import reportWebVitals from './reportWebVitals.ts';

// Import the global CSS file
import './styles.css';
import { GetSessionCookie } from './utils/common/cookieHandler.ts';
import { ThemeProvider } from '@/utils/common/components/ThemeProvider';

// Create a new router instance
const router = createRouter({
  routeTree,
  history: createHashHistory(),
  context: {
    ...TanstackQuery.getContext(),
    session: await GetSessionCookie() || {
      roleName: '',
      dashboardFlag: false,
      accessType: 0,
      ticketCount: false,
      alertCount: false,
      customerName: '',
      customerLogopath: '',
      accesstoken: '',
      userMapDetails: [],
      poMapDetails: {
        approverId: 0,
        userMapDetails: [],
      },
      companyLogopath: '',
      userName: '',
      subscriptionId: 0,
      subscriptionName: '',
      login_Attempt: null,
      first_Login: false,
      userTypeId: 0,
      customerId: 0,
      userTypeName: '',
      companyName: '',
      emailId: '',
      userId: 0,
      roleId: 0,
      isNewUser: false,
      companyId: 0,
    },
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(

    <StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TanstackQuery.Provider>

          <RouterProvider router={router} />

        </TanstackQuery.Provider>
      </ThemeProvider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
