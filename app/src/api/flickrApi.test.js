import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchFlickr, FlickrApiError } from "./flickrApi.js";

function mockJsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("Flickr API client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("serializes request parameters and returns successful data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockJsonResponse({
        stat: "ok",
        photos: { photo: [] },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const data = await fetchFlickr({
      method: "flickr.photos.getRecent",
      extras: ["url_z", "url_o"],
      page: 2,
      empty: "",
    });

    expect(data).toEqual({ stat: "ok", photos: { photo: [] } });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/flickr?");
    expect(url).toContain("method=flickr.photos.getRecent");
    expect(url).toContain("extras=url_z%2Curl_o");
    expect(url).toContain("page=2");
    expect(url).not.toContain("empty=");
  });

  it("uses the configured API base URL without a trailing slash", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test/api/");
    const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ stat: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchFlickr({ method: "flickr.people.findByUsername", username: "alice" });

    expect(fetchMock.mock.calls[0][0]).toContain("https://api.example.test/api/flickr?");
  });

  it("uses the same-origin API route in production by default", async () => {
    vi.stubEnv("PROD", true);
    const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ stat: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchFlickr({ method: "flickr.photos.getRecent" });

    expect(fetchMock.mock.calls[0][0]).toContain("/api/flickr?");
    expect(fetchMock.mock.calls[0][0]).not.toContain("onrender.com");
  });

  it("forwards an abort signal to fetch", async () => {
    const signal = new AbortController().signal;
    const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ stat: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchFlickr({ method: "flickr.photos.getRecent" }, { signal });

    expect(fetchMock.mock.calls[0][1]).toEqual({ signal });
  });

  it("throws FlickrApiError for HTTP failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({ message: "Proxy failed", code: 502 }, false, 502))
    );

    await expect(fetchFlickr({ method: "flickr.photos.getRecent" })).rejects.toMatchObject({
      name: "FlickrApiError",
      message: "Proxy failed",
      code: 502,
    });
  });

  it("throws FlickrApiError for Flickr failure payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({ stat: "fail", message: "User not found", code: 1 }))
    );

    await expect(fetchFlickr({ method: "flickr.people.findByUsername" })).rejects.toBeInstanceOf(
      FlickrApiError
    );
  });
});
