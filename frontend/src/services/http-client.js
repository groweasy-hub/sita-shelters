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
function buildUrl(baseUrl, path, query) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBase);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
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
    const response = await fetchImplementation(
      buildUrl(baseUrl, path, options.query),
      {
        method,
        headers: {
          Accept: "application/json",
          ...(hasBody ? { "Content-Type": "application/json" } : {}),
          ...defaultHeaders,
          ...options.headers,
        },
        body: hasBody ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
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
