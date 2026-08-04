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

describe("useUserGallery", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchFlickrMock.mockReset();
  });

  it("requests public gallery photos with resilient Flickr image extras", async () => {
    const { useUserGallery } = await import("./useUserGallery.js");
    fetchFlickrMock
      .mockResolvedValueOnce({
        stat: "ok",
        user: { id: "alice-id" },
      })
      .mockResolvedValueOnce({
        stat: "ok",
        photos: {
          page: 1,
          pages: 1,
          total: "1",
          photo: [{ id: "photo-1", title: "Visible", ownername: "Alice", url_z: "visible.jpg" }],
        },
      });

    const gallery = useUserGallery();

    await gallery.searchUserGallery("alice");

    expect(fetchFlickrMock).toHaveBeenNthCalledWith(
      2,
      {
        method: "flickr.people.getPublicPhotos",
        extras: ["url_s", "url_m", "url_n", "url_z", "url_c", "url_o", "tags", "date_taken", "owner_name"],
        page: 1,
        per_page: 12,
        user_id: "alice-id",
      },
      { signal: expect.any(AbortSignal) }
    );
    expect(gallery.photos.value).toEqual([
      {
        id: "photo-1",
        title: "Visible",
        ownername: "Alice",
        url_z: "visible.jpg",
        imageCandidates: ["visible.jpg"],
        imageUrl: "visible.jpg",
      },
    ]);
  });

  it("clears the previous gallery immediately when a new username search starts", async () => {
    const { useUserGallery } = await import("./useUserGallery.js");
    let resolveSecondLookup;

    fetchFlickrMock
      .mockResolvedValueOnce({
        stat: "ok",
        user: { id: "alice-id" },
      })
      .mockResolvedValueOnce({
        stat: "ok",
        photos: {
          page: 1,
          pages: 1,
          total: "1",
          photo: [{ id: "alice-photo", title: "Alice photo", ownername: "Alice", url_z: "alice.jpg" }],
        },
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondLookup = resolve;
          })
      );

    const gallery = useUserGallery();

    await gallery.searchUserGallery("alice");
    const secondSearch = gallery.searchUserGallery("ubuntu");

    expect(gallery.photos.value).toEqual([]);
    expect(gallery.ownerName.value).toBe("");
    expect(gallery.currentPage.value).toBe(1);
    expect(gallery.totalPages.value).toBe(1);
    expect(gallery.isLoading.value).toBe(true);

    resolveSecondLookup({ stat: "ok", user: { id: "ubuntu-id" } });
    fetchFlickrMock.mockResolvedValueOnce({
      stat: "ok",
      photos: {
        page: 1,
        pages: 1,
        total: "0",
        photo: [],
      },
    });
    await secondSearch;
  });
});
