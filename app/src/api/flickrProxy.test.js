import { describe, expect, it, vi } from "vitest";
import { buildFlickrProxyResponse } from "./flickrProxy.js";

function flickrResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

function requestParams(params) {
  return new URLSearchParams(params);
}

describe("Flickr proxy handler", () => {
  it("forwards supported methods with server credentials and fixed response parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      flickrResponse({
        stat: "ok",
        photos: { photo: [] },
      })
    );

    const response = await buildFlickrProxyResponse({
      searchParams: requestParams({
        method: "flickr.photos.getRecent",
        api_key: "browser-secret",
        format: "xml",
        nojsoncallback: "0",
        page: "2",
      }),
      apiKey: "server-secret",
      fetchImpl: fetchMock,
    });

    expect(response).toEqual({
      status: 200,
      body: { stat: "ok", photos: { photo: [] } },
    });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [upstreamUrl] = fetchMock.mock.calls[0];
    const url = new URL(upstreamUrl);
    expect(url.origin).toBe("https://api.flickr.com");
    expect(url.pathname).toBe("/services/rest");
    expect(url.searchParams.get("method")).toBe("flickr.photos.getRecent");
    expect(url.searchParams.get("api_key")).toBe("server-secret");
    expect(url.searchParams.get("format")).toBe("json");
    expect(url.searchParams.get("nojsoncallback")).toBe("1");
    expect(url.searchParams.get("page")).toBe("2");
    expect(upstreamUrl).not.toContain("browser-secret");
  });

  it("rejects unsupported methods without contacting Flickr", async () => {
    const fetchMock = vi.fn();

    const response = await buildFlickrProxyResponse({
      searchParams: requestParams({ method: "flickr.photos.search" }),
      apiKey: "server-secret",
      fetchImpl: fetchMock,
    });

    expect(response).toEqual({
      status: 400,
      body: {
        stat: "fail",
        code: 400,
        message: "Unsupported Flickr method.",
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a safe configuration error when API_KEY is missing", async () => {
    const response = await buildFlickrProxyResponse({
      searchParams: requestParams({ method: "flickr.photos.getRecent" }),
      apiKey: "",
      fetchImpl: vi.fn(),
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      stat: "fail",
      code: 500,
      message: "Missing Flickr API key. Set API_KEY in environment.",
    });
    expect(JSON.stringify(response.body)).not.toContain("secret");
  });

  it("normalizes Flickr HTTP failures without leaking upstream request details", async () => {
    const response = await buildFlickrProxyResponse({
      searchParams: requestParams({ method: "flickr.photos.getRecent" }),
      apiKey: "server-secret",
      fetchImpl: vi.fn().mockResolvedValue(flickrResponse({ error: "nope" }, false, 503)),
    });

    expect(response).toEqual({
      status: 503,
      body: {
        stat: "fail",
        code: 503,
        message: "Flickr request failed.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("server-secret");
  });

  it("preserves Flickr stat fail codes and messages", async () => {
    const response = await buildFlickrProxyResponse({
      searchParams: requestParams({ method: "flickr.people.findByUsername" }),
      apiKey: "server-secret",
      fetchImpl: vi
        .fn()
        .mockResolvedValue(flickrResponse({ stat: "fail", code: 1, message: "User not found" })),
    });

    expect(response).toEqual({
      status: 400,
      body: {
        stat: "fail",
        code: 1,
        message: "User not found",
      },
    });
  });

  it("returns a safe bad gateway error for network or JSON failures", async () => {
    const response = await buildFlickrProxyResponse({
      searchParams: requestParams({ method: "flickr.photos.getRecent" }),
      apiKey: "server-secret",
      fetchImpl: vi.fn().mockRejectedValue(new Error("socket includes server-secret")),
    });

    expect(response).toEqual({
      status: 502,
      body: {
        stat: "fail",
        code: 502,
        message: "Failed to fetch data from Flickr.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("server-secret");
  });
});
