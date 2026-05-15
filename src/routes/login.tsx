import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import Loader from '@/utils/common/components/loader';
import { SetSessionCookie } from '@/utils/common/cookieHandler';
import { useNavStore } from '@/stores/navItemsStore';
import Login from '@/components/login/Login';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const searchParams: Record<string, string> = useSearch({ from: '/login' });

  const setNavItemsFromSession = useNavStore(
    (state) => state.setNavItemsFromSession,
  );

  const domain = import.meta.env.PROD
    ? import.meta.env.VITE_INSPIRE_DOMAIN
    : import.meta.env.VITE_DEV_DOMAIN;

  // useEffect(() => {
  //   if (sessionStorage.getItem('session')) {
  //     const session: Session = JSON.parse(sessionStorage.getItem('session')!);
  //     console.log('Already logged in');
  //     sessionStorage.setItem('session', JSON.stringify(session));
  //     setNavItemsFromSession(session);
  //     SetSessionCookie(session);
  //     router.invalidate();
  //     window.location.replace(
  //       import.meta.env.VITE_BASE_URL
  //         ? `${import.meta.env.VITE_BASE_URL}/`
  //         : '/saas-po/',
  //     );
  //     return;
  //   }

  //   const handleMessage = (event: MessageEvent) => {
  //     console.info('Login message received');

  //     const { type, session }: { type: string; session?: Session } =
  //       event.data || {};
  //     if (type === 'SESSION_DATA' && session && session.accesstoken) {
  //       try {
  //         console.info('Handling session data');
  //         sessionStorage.setItem('session', JSON.stringify(session));
  //         SetSessionCookie(session);
  //         setNavItemsFromSession(session);
  //         console.info('Access Granted');
  //         router.invalidate();
  //         window.location.replace(
  //           import.meta.env.VITE_BASE_URL
  //             ? `${import.meta.env.VITE_BASE_URL}/`
  //             : '/saas-po/',
  //         );
  //       } catch (err) {
  //         console.error('Failed to handle session data:', err);
  //       }
  //     } else {
  //       console.error('Invalid session message received');
  //     }
  //   };

  //   window.addEventListener('message', handleMessage);

  //   const fallbackTimeout = setTimeout(() => {
  //     // during local development and testing comment below line
  //     // const queryString = new URLSearchParams(searchParams).toString();
  //     // window.location.replace(`${domain}/?${queryString}`);
  //   }, 10000);

  //   return () => {
  //     window.removeEventListener('message', handleMessage);
  //     clearTimeout(fallbackTimeout);
  //   };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // return <Loader />;
  return <Login />;
}
