import { describe, expect, it } from "vitest";
import { getPhotoImageUrl, normalizePhoto } from "./photo.js";

describe("photo utilities", () => {
  it("prefers the medium Flickr image URL", () => {
    expect(getPhotoImageUrl({ url_z: "medium.jpg", url_o: "original.jpg" })).toBe("medium.jpg");
  });

  it("falls back to the original image URL", () => {
    expect(getPhotoImageUrl({ url_o: "original.jpg" })).toBe("original.jpg");
  });

  it("returns an empty URL when no display image is available", () => {
    expect(getPhotoImageUrl({ title: "No image" })).toBe("");
  });

  it("adds imageUrl while preserving Flickr metadata", () => {
    const photo = { id: "1", title: "Bridge", url_o: "bridge.jpg", tags: "city night" };

    expect(normalizePhoto(photo)).toEqual({
      id: "1",
      title: "Bridge",
      url_o: "bridge.jpg",
      tags: "city night",
      imageUrl: "bridge.jpg",
    });
  });
});
