import { useState, useEffect, useRef } from 'react';

export function useCountUp(
  target: number,
  duration: number = 800,
  startOnMount: boolean = true,
  prefix: string = '',
  suffix: string = '',
  decimals: number = 0
) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!startOnMount) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, startOnMount]);

  const formatted = `${prefix}${value.toFixed(decimals)}${suffix}`;
  return { value, formatted };
}
