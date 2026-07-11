import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchFlickrMock } = vi.hoisted(() => ({
  fetchFlickrMock: vi.fn(),
}));

vi.mock("@/api/flickrApi.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchFlickr: fetchFlickrMock,
  };
});

describe("useRecentPhotos", () => {
  beforeEach(() => {
    fetchFlickrMock.mockReset();
  });

  it("loads and normalizes the first page of recent photos", async () => {
    const { useRecentPhotos } = await import("./useRecentPhotos.js");
    fetchFlickrMock.mockResolvedValue({
      photos: {
        page: 1,
        pages: 2,
        photo: [
          { id: "1", title: "Visible", url_z: "visible.jpg" },
          { id: "2", title: "Hidden" },
        ],
      },
    });

    const recent = useRecentPhotos();

    await recent.loadNextPage();

    expect(fetchFlickrMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "flickr.photos.getRecent",
        page: 1,
        per_page: 35,
      }),
      { signal: expect.any(AbortSignal) }
    );
    expect(recent.allPhotos.value).toEqual([
      { id: "1", title: "Visible", url_z: "visible.jpg", imageUrl: "visible.jpg" },
    ]);
    expect(recent.hasMore.value).toBe(true);
    expect(recent.isLoading.value).toBe(false);
  });

  it("deduplicates loaded photos and removes a photo by id", async () => {
    const { useRecentPhotos } = await import("./useRecentPhotos.js");
    fetchFlickrMock
      .mockResolvedValueOnce({
        photos: {
          page: 1,
          pages: 3,
          photo: [{ id: "1", title: "One", url_o: "one.jpg" }],
        },
      })
      .mockResolvedValueOnce({
        photos: {
          page: 2,
          pages: 3,
          photo: [
            { id: "1", title: "One duplicate", url_o: "one-again.jpg" },
            { id: "2", title: "Two", url_o: "two.jpg" },
          ],
        },
      });

    const recent = useRecentPhotos();

    await recent.loadNextPage();
    await recent.loadNextPage();
    recent.removePhoto("1");

    expect(recent.allPhotos.value.map((photo) => photo.id)).toEqual(["2"]);
  });

  it("stores a friendly error when loading fails", async () => {
    const { FlickrApiError } = await import("@/api/flickrApi.js");
    const { useRecentPhotos } = await import("./useRecentPhotos.js");
    fetchFlickrMock.mockRejectedValue(new FlickrApiError("Flickr is unavailable", 502));

    const recent = useRecentPhotos();

    await recent.loadNextPage();

    expect(recent.error.value).toBe("Flickr is unavailable");
    expect(recent.isLoading.value).toBe(false);
  });

  it("cancels active loading without exposing an abort error", async () => {
    const { useRecentPhotos } = await import("./useRecentPhotos.js");
    let rejectRequest;
    fetchFlickrMock.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        })
    );

    const recent = useRecentPhotos();
    const loading = recent.loadNextPage();
    recent.cancelLoading();
    rejectRequest(Object.assign(new Error("Aborted"), { name: "AbortError" }));
    await loading;

    expect(recent.error.value).toBe("");
    expect(recent.isLoading.value).toBe(false);
  });
});
