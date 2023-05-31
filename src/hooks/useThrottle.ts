import { useCallback, useLayoutEffect, useRef } from "react";

export function useThrottle(cb: (...arg: any[]) => void, gap: number) {
  const shouldWaitRef = useRef(false);
  const callbackRef = useRef(cb);

  useLayoutEffect(() => {
    callbackRef.current = cb;
  });

  return useCallback(
    (...args: any[]) => {
      if (shouldWaitRef.current) return;
      callbackRef.current(...args);
      shouldWaitRef.current = true;
      setTimeout(() => {
        shouldWaitRef.current = false;
      }, gap);
    },
    [gap]
  );
}
