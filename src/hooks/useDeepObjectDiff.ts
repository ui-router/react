/** @packageDocumentation @internalapi @module react_hooks */
import { equals } from '@uirouter/core';
import { useRef } from 'react';

/** Internal hook to support deep diffing in hook dependencies */
export function useDeepObjectDiff(obj: object): number {
  const ref = useRef(obj);
  const version = useRef(1);
  const deepEqual = obj === ref.current || equals(obj, ref.current);
  ref.current = obj;
  if (!deepEqual) {
    version.current++;
  }
  return version.current;
}
