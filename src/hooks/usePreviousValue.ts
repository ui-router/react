import { useRef } from 'react';

export function usePreviousValue<T>(value: T): T {
  const valueRef = useRef<T>();
  const previous = valueRef.current;
  valueRef.current = value;
  return previous;
}
