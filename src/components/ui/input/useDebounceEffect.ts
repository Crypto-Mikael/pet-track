import { useEffect, type DependencyList } from "react";

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: DependencyList,
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: fn and waitTime are intentionally included in the dependency array dynamically
  useEffect(() => {
    const t = setTimeout(() => {
      fn();
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  }, deps ? [...deps, fn, waitTime] : [fn, waitTime]);
}
