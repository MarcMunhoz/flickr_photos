import { describe, expect, it } from "vitest";
import { formatPhotoDate } from "./date.js";

describe("date utilities", () => {
  it("formats a Flickr date for display", () => {
    expect(formatPhotoDate("2026-07-11 14:30:00")).toBe("July 11, 2026");
  });

  it("returns an unknown date label for invalid values", () => {
    expect(formatPhotoDate("not-a-date")).toBe("Unknown date");
  });

  it("returns an unknown date label for missing values", () => {
    expect(formatPhotoDate()).toBe("Unknown date");
  });
});
