export class HttpError extends Error {
  status;
  statusText;
  body;
  constructor(message, details) {
    super(message);
    this.name = "HttpError";
    this.status = details.status;
    this.statusText = details.statusText;
    this.body = details.body;
  }
}
function resolveBaseUrl(baseUrl) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  if (/^https?:\/\//i.test(normalizedBase)) {
    return normalizedBase;
  }

  if (normalizedBase.startsWith("/")) {
    // API calls are normally made by client components. The server fallback
    // makes the helper deterministic in Node-based tests and local SSR; the
    // production client always resolves this against its Vercel origin.
    const origin =
      typeof window === "undefined"
        ? "http://localhost:3000"
        : window.location.origin;
    return new URL(normalizedBase, origin).toString();
  }

  throw new Error("API base URL must be an absolute URL or start with '/'");
}

function buildUrl(baseUrl, path, query) {
  const normalizedBase = resolveBaseUrl(baseUrl);
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBase);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}
// Nothing else in this app ever bounds how long a request can hang — a
// backend that's down, crash-looping, or just never responds otherwise
// leaves a fetch pending forever, which is exactly what kept the loading
// gate (isPending never settles) stuck indefinitely instead of failing and
// letting the caller redirect to /login. Every request gets a ceiling by
// default; callers needing longer (e.g. a slow file upload) can override it.
const DEFAULT_TIMEOUT_MS = 15000;

function withTimeout(callerSignal, timeoutMs) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!callerSignal) {
    return timeoutSignal;
  }
  // AbortSignal.any isn't available in every runtime this could conceivably
  // run in; fall back to just the timeout rather than throwing.
  return typeof AbortSignal.any === "function"
    ? AbortSignal.any([callerSignal, timeoutSignal])
    : timeoutSignal;
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return undefined;
  }
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text.length > 0 ? text : undefined;
}
/**
 * Prepared fetch adapter. It is intentionally not instantiated or exported as
 * a singleton; application bootstrap must provide an approved backend base URL
 * before any feature can use it.
 */
export function createFetchHttpClient({
  baseUrl,
  defaultHeaders = {},
  fetchImplementation = fetch,
}) {
  if (baseUrl.trim().length === 0) {
    throw new Error("A non-empty API base URL is required");
  }
  async function request(method, path, options = {}) {
    const hasBody = options.body !== undefined;
    // A FormData body (file uploads) must be sent as-is — the browser sets
    // its own multipart Content-Type with the correct boundary; JSON-string
    // it and it stops being readable as a file on the server.
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    let requestBody;
    if (hasBody) {
      requestBody = isFormData ? options.body : JSON.stringify(options.body);
    }
    const response = await fetchImplementation(
      buildUrl(baseUrl, path, options.query),
      {
        method,
        headers: {
          Accept: "application/json",
          ...(hasBody && !isFormData
            ? { "Content-Type": "application/json" }
            : {}),
          ...defaultHeaders,
          ...options.headers,
        },
        body: requestBody,
        signal: withTimeout(options.signal, options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
        // The Vercel proxy and local direct API both need the session cookie
        // on fetch requests. Browsers do not include it by default.
        credentials: options.credentials ?? "include",
        cache: options.cache ?? "no-store",
      },
    );
    const body = await parseResponseBody(response);
    if (!response.ok) {
      throw new HttpError(`Request failed with status ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        body,
      });
    }
    return body;
  }
  return {
    get: (path, options) => request("GET", path, options),
    post: (path, options) => request("POST", path, options),
    put: (path, options) => request("PUT", path, options),
    patch: (path, options) => request("PATCH", path, options),
    delete: (path, options) => request("DELETE", path, options),
  };
}
