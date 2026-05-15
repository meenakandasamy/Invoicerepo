// import { useRouterState, useNavigate, useBlocker } from '@tanstack/react-router';
// import { toast } from 'sonner';
// import { useSidebarStore } from '@/stores/sidebarStore';

// const basePath = import.meta.env.VITE_BASE_URL || '/'; // Ensure basePath is defined and handled consistently

// // Paths explicitly allowed when in 'settings' mode
// const allowedSettingsPaths = [`${basePath}/po/admin/role`];

// // Paths explicitly allowed when in 'menu' mode (from your navItems)
// const allowedMenuPaths = [
//   `${basePath}/`, // Home
//   `${basePath}/login`, // Login page
//   `${basePath}/config`, // Assuming 'config' means basePath/config
//   `${basePath}/po/approval`,
//   `${basePath}/po/approvaldashboard`,
//   `${basePath}/po/purchaseOrder`,
//   `${basePath}/po/installment`,
//   `${basePath}/po/vendor`,
//   `${basePath}/po/product`,
//   `${basePath}/po/paymentTerm`
// ];

// // Helper to normalize paths for consistent comparison (remove trailing slash unless it's just '/')
// const normalizePath = (path: string) => {
//   if (path.length > 1 && path.endsWith('/')) {
//     return path.slice(0, -1);
//   }
//   return path;
// };

// export const useNavigationGuard = () => {
//   const { mode } = useSidebarStore();
//   const navigate = useNavigate();

//   // The useBlocker hook correctly checks the `next` location
//   useBlocker({
//     shouldBlockFn: ({ current, next }) => {
//       const nextPath = normalizePath(next.pathname); // Normalize the target path

//       const currentMode = useSidebarStore.getState().mode; // Get current mode directly in the blocker callback

//       const isSettingsMode = currentMode === 'settings';
//       const isMenuMode = currentMode === 'menu';

//       const isAllowedInSettings = allowedSettingsPaths.some(path =>
//         nextPath === normalizePath(path) || nextPath.startsWith(`${normalizePath(path)}/`)
//       );
      
//       const isAllowedInMenu = allowedMenuPaths.some(path =>
//         nextPath === normalizePath(path) || nextPath.startsWith(`${normalizePath(path)}/`)
//       );

//       // --- Logic for Settings Mode ---
//       if (isSettingsMode) {
//         // If in settings mode and the next path is NOT allowed in settings, and it's not the exact homepage
//         // (The `isAllowedInSettings` should cover the homepage if it's in `allowedSettingsPaths`)
//         if (!isAllowedInSettings) {
//           toast.info('Please exit Admin mode to access this page');
//           navigate({ to: `${basePath}`, replace: true }); // Redirect to homepage as per goal
//           return true; // Block the current navigation
//         }
//       } 
//       // --- Logic for Menu Mode ---
//       else if (isMenuMode) {
//         // If in menu mode and the next path is NOT allowed in menu
//         if (!isAllowedInMenu) {
//           toast.info('Please use sidebar for navigation'); // More general toast for menu mode
//           navigate({ to: `${basePath}`, replace: true }); // Redirect to homepage
//           return true; // Block the current navigation
//         }
//       }

//       return false; // Allow navigation if no blocking condition is met
//     },
//   });
// };

// import { useSidebarStore } from '@/stores/sidebarStore';
// import { useEffect } from 'react';
// import { toast } from 'sonner';

// const RouterGuardToast = () => {
//   const { illegalNavigationMessage, setIllegalNavigationMessage } = useSidebarStore();

//   useEffect(() => {
//     if (illegalNavigationMessage) {
//       toast.info(illegalNavigationMessage);
//       setIllegalNavigationMessage(null); // Reset after showing
//     }
//   }, [illegalNavigationMessage]);

//   return null;
// };

// export default RouterGuardToast;
