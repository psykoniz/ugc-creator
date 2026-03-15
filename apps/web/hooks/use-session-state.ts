"use client";

import { useState, useCallback } from "react";

/**
 * Persists state to localStorage (survives tab close & browser restart).
 * All keys are prefixed with "ugc:" to avoid collisions.
 *
 * NOTE: Previously used sessionStorage — migrated to localStorage so that
 * experiment history is preserved across sessions.
 */
export function useSessionState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const prefixedKey = `ugc:${key}`;

  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      // Try localStorage first, fall back to sessionStorage for migration
      const stored = localStorage.getItem(prefixedKey)
        ?? sessionStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        // Migrate from sessionStorage to localStorage
        if (!localStorage.getItem(prefixedKey)) {
          localStorage.setItem(prefixedKey, stored);
          sessionStorage.removeItem(key);
        }
        return parsed;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setState(value);
      try {
        localStorage.setItem(prefixedKey, JSON.stringify(value));
      } catch {
        // ignore quota errors
      }
    },
    [prefixedKey]
  );

  return [state, setValue];
}
