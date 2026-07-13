const DEFAULT_API_BASE_URL = "/api";

/**
 * Represents errors returned by either the application proxy or Flickr.
 * The optional code preserves the upstream error code for UI-specific handling.
 */
export class FlickrApiError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = "FlickrApiError";
    this.code = code;
  }
}

function getApiBaseUrl() {
  // Deployments can override the hosted proxy without changing application code.
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  return DEFAULT_API_BASE_URL;
}

/**
 * Sends an encoded request to the Flickr proxy and normalizes HTTP/API failures.
 * An AbortSignal may be supplied by composables that cancel stale requests.
 */
export async function fetchFlickr(params, options = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }
  });

  const response = await fetch(`${getApiBaseUrl()}/flickr?${query.toString()}`, {
    signal: options.signal,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new FlickrApiError(
      data.message || `Flickr request failed with status ${response.status}.`,
      data.code || response.status
    );
  }

  if (data.stat === "fail") {
    throw new FlickrApiError(data.message || "Flickr rejected the request.", data.code);
  }

  return data;
}
