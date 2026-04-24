"use client";

import { createContext, useContext } from "react";

export interface ErrorContextValue {
  error: string | null;
  showError: (message: string) => void;
  clearError: () => void;
}

export const ErrorContext = createContext<ErrorContextValue>({
  error: null,
  showError: () => {},
  clearError: () => {},
});

export function useGlobalError() {
  return useContext(ErrorContext);
}

let globalShowError: ((message: string) => void) | null = null;

export function setGlobalShowError(fn: (message: string) => void) {
  globalShowError = fn;
}

export function reportError(message: string) {
  globalShowError?.(message);
}
