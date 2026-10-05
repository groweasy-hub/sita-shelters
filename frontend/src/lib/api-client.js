import { createFetchHttpClient } from "@/services/http-client";

/**
 * The one fetch boundary every feature's `api*Adapter` should call through.
 * In Vercel it uses the same-origin `/api/*` proxy, which forwards requests
 * to the Railway API without cross-site-cookie or preview-domain CORS issues.
 * `NEXT_PUBLIC_API_URL` remains available for intentional direct API calls,
 * such as local development against http://localhost:4000.
 */
export const apiClient = createFetchHttpClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/",
});
