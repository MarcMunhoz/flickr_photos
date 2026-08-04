import { describe, expect, it } from "vitest";
import { getPhotoImageCandidates, getPhotoImageUrl, normalizePhoto } from "./photo.js";

describe("photo utilities", () => {
  it("prefers the lightweight Flickr image URL", () => {
    expect(getPhotoImageUrl({ url_n: "small-320.jpg", url_z: "medium.jpg", url_o: "original.jpg" })).toBe("small-320.jpg");
  });

  it("orders Flickr image candidates from lightweight display size to original fallback", () => {
    expect(
      getPhotoImageCandidates({
        url_o: "original.jpg",
        url_s: "small-square.jpg",
        url_m: "small-240.jpg",
        url_n: "small-320.jpg",
        url_c: "medium-800.jpg",
        url_z: "medium-640.jpg",
      })
    ).toEqual(["small-320.jpg", "small-240.jpg", "small-square.jpg", "medium-640.jpg", "medium-800.jpg", "original.jpg"]);
  });

  it("skips missing and duplicate Flickr image candidates", () => {
    expect(
      getPhotoImageCandidates({
        url_z: "shared.jpg",
        url_c: "",
        url_n: "small-320.jpg",
        url_m: "shared.jpg",
      })
    ).toEqual(["small-320.jpg", "shared.jpg"]);
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
      imageCandidates: ["bridge.jpg"],
      imageUrl: "bridge.jpg",
    });
  });
});
