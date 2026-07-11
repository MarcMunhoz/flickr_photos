import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { usePhotoFilters } from "./usePhotoFilters.js";

const photos = [
  {
    id: "1",
    title: "Mountain sunrise",
    ownername: "Alice",
    tags: "nature sunrise mountain",
    datetaken: "2026-07-10 08:00:00",
    safety_level: "1",
  },
  {
    id: "2",
    title: "City night",
    ownername: "Bob",
    tags: "city nsfw",
    datetaken: "2026-07-11 21:00:00",
    safety_level: "3",
  },
  {
    id: "3",
    title: "Broken date",
    ownername: "Alice",
    tags: "archive",
    datetaken: "not-a-date",
    safety_level: "1",
  },
];

describe("usePhotoFilters", () => {
  it("filters by title, owner, tags, and inclusive date range", () => {
    const { filters, filteredPhotos, activeFilterCount, hasActiveFilters } = usePhotoFilters(ref(photos));

    filters.value.subject = "mountain";
    filters.value.owner = "Alice";
    filters.value.tags = "nature, sun";
    filters.value.dateFrom = "2026-07-10";
    filters.value.dateTo = "2026-07-10";

    expect(filteredPhotos.value.map((photo) => photo.id)).toEqual(["1"]);
    expect(hasActiveFilters.value).toBe(true);
    expect(activeFilterCount.value).toBe(4);
  });

  it("hides sensitive photos without counting safety as a visible filter", () => {
    const { filters, filteredPhotos, activeFilterCount, hasActiveFilters } = usePhotoFilters(ref(photos));

    filters.value.hideSensitive = true;

    expect(filteredPhotos.value.map((photo) => photo.id)).toEqual(["1", "3"]);
    expect(hasActiveFilters.value).toBe(false);
    expect(activeFilterCount.value).toBe(0);
  });

  it("resets search filters while preserving the safety preference", () => {
    const { filters, resetFilters } = usePhotoFilters(ref(photos));

    filters.value.subject = "city";
    filters.value.owner = "Bob";
    filters.value.hideSensitive = true;

    resetFilters();

    expect(filters.value).toEqual({
      dateFrom: null,
      dateTo: null,
      subject: "",
      owner: "",
      tags: "",
      hideSensitive: true,
    });
  });
});
