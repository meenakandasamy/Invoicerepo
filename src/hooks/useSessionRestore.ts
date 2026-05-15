import { useEffect } from 'react';
import { useNavStore } from '@/stores/navItemsStore';

export function useRestoreSession() {
  const setNavItemsFromSession = useNavStore(
    (state) => state.setNavItemsFromSession,
  );

  useEffect(() => {
    const sessionRaw = sessionStorage.getItem('session');
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        // console.log('Session restored:', session);
        console.warn(
          'A active session was found in session storage and restored.',
        );

        if (session?.accesstoken) {
          setNavItemsFromSession(session);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      }
    }
  }, []);
}
