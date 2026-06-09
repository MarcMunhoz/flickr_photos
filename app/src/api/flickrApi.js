const DEFAULT_PRODUCTION_API_URL = "https://flickr-public-photos.onrender.com/api";

export class FlickrApiError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = "FlickrApiError";
    this.code = code;
  }
}

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  return import.meta.env.PROD ? DEFAULT_PRODUCTION_API_URL : "/api";
}

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
