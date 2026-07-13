import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../netlify/functions/flickr.js";

function flickrResponse(body) {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("Netlify Flickr function", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("handles the existing /api/flickr query shape without contacting live Flickr", async () => {
    vi.stubEnv("API_KEY", "server-secret");
    const fetchMock = vi.fn().mockResolvedValue(
      flickrResponse({
        stat: "ok",
        photos: { photo: [] },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await handler(
      new Request("https://example.netlify.app/api/flickr?method=flickr.photos.getRecent&page=2")
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      stat: "ok",
      photos: { photo: [] },
    });

    const [upstreamUrl] = fetchMock.mock.calls[0];
    const url = new URL(upstreamUrl);
    expect(url.searchParams.get("api_key")).toBe("server-secret");
    expect(url.searchParams.get("method")).toBe("flickr.photos.getRecent");
    expect(url.searchParams.get("page")).toBe("2");
  });

  it("rejects non-GET requests without contacting Flickr", async () => {
    vi.stubEnv("API_KEY", "server-secret");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await handler(
      new Request("https://example.netlify.app/api/flickr?method=flickr.photos.getRecent", {
        method: "POST",
      })
    );

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toEqual({
      stat: "fail",
      code: 405,
      message: "Method not allowed.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
