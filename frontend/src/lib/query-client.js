import { QueryClient } from "@tanstack/react-query";
import { QUERY_DEFAULTS } from "../config/constants";
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function getHttpStatus(error) {
  if (!isRecord(error)) {
    return undefined;
  }
  if (typeof error.status === "number") {
    return error.status;
  }
  if (isRecord(error.response) && typeof error.response.status === "number") {
    return error.response.status;
  }
  return undefined;
}
export function shouldRetryQuery(failureCount, error) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return false;
  }
  const status = getHttpStatus(error);
  if (status !== undefined && status >= 400 && status < 500 && status !== 408) {
    return false;
  }
  return failureCount < QUERY_DEFAULTS.maxRetries;
}
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: QUERY_DEFAULTS.staleTimeMs,
      gcTime: QUERY_DEFAULTS.garbageCollectionTimeMs,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
};
/** Create one client per browser session or per server request. */
export function createQueryClient() {
  return new QueryClient(queryClientConfig);
}
