const FLICKR_REST_URL = "https://api.flickr.com/services/rest";
const FIXED_PROXY_KEYS = new Set(["format", "nojsoncallback", "api_key"]);

export const ALLOWED_FLICKR_METHODS = new Set([
  "flickr.people.findByUsername",
  "flickr.people.getPublicPhotos",
  "flickr.photos.getRecent",
]);

function jsonProxyResponse(status, body) {
  return { status, body };
}

function normalizeApiKey(apiKey) {
  return String(apiKey || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

function getRequestMethod(searchParams) {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get("method");
  }

  return searchParams?.method;
}

function getSearchEntries(searchParams) {
  if (searchParams instanceof URLSearchParams) {
    return Array.from(searchParams.entries());
  }

  return Object.entries(searchParams || {});
}

export async function buildFlickrProxyResponse({
  searchParams,
  apiKey = process.env.API_KEY,
  fetchImpl = fetch,
} = {}) {
  const flickrApiKey = normalizeApiKey(apiKey);

  if (!flickrApiKey) {
    return jsonProxyResponse(500, {
      stat: "fail",
      code: 500,
      message: "Missing Flickr API key. Set API_KEY in environment.",
    });
  }

  if (!ALLOWED_FLICKR_METHODS.has(getRequestMethod(searchParams))) {
    return jsonProxyResponse(400, {
      stat: "fail",
      code: 400,
      message: "Unsupported Flickr method.",
    });
  }

  const upstreamParams = new URLSearchParams({
    format: "json",
    nojsoncallback: "1",
    api_key: flickrApiKey,
  });

  for (const [key, value] of getSearchEntries(searchParams)) {
    if (!FIXED_PROXY_KEYS.has(key)) {
      upstreamParams.append(key, String(value));
    }
  }

  try {
    const response = await fetchImpl(`${FLICKR_REST_URL}?${upstreamParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return jsonProxyResponse(response.status, {
        stat: "fail",
        code: response.status,
        message: "Flickr request failed.",
      });
    }

    return jsonProxyResponse(data.stat === "fail" ? 400 : 200, data);
  } catch {
    return jsonProxyResponse(502, {
      stat: "fail",
      code: 502,
      message: "Failed to fetch data from Flickr.",
    });
  }
}
