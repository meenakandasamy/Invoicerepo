import { useRouter } from '@tanstack/react-router';

export function useRouterContext() {
  const router = useRouter();

  const context = router.options.context;
  return context;
}
