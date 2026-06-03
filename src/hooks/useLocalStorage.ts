import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
  const initialValueRef = useRef(initialValue);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) return JSON.parse(item) as T;
    } catch (err) {
      console.warn('useLocalStorage: failed to read', key, err);
    }
    return initialValue instanceof Function ? initialValue() : initialValue;
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch (err) {
          console.warn('useLocalStorage: failed to write', key, err);
        }
        return nextValue;
      });
    },
    [key],
  );

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          if (e.newValue) {
            setStoredValue(JSON.parse(e.newValue) as T);
          } else {
            const iv = initialValueRef.current;
            setStoredValue(iv instanceof Function ? iv() : iv);
          }
        } catch (err) {
          console.warn('useLocalStorage: failed to sync storage event', key, err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [storedValue, setValue];
}
