import { useEffect, useRef, useState } from 'react';

export function useResizeObserver<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  DOMRect | null,
] {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState<DOMRect | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setBounds(entry.contentRect);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, bounds];
}
