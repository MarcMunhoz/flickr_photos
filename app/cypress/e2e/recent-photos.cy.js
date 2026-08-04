describe("recent public photos", () => {
  it("loads recent photos and filters by title, publisher, tags, and safe content", () => {
    cy.fixture("recent-photos").then((recentPhotos) => {
      cy.mockFlickrMethod("flickr.photos.getRecent", recentPhotos, "getRecent");
    });

    cy.visit("/recent-photos");
    cy.wait("@getRecent");
    cy.get(".gallery-item").should("have.length", 3);
    cy.get(".gallery-item").first().find("img").should("have.attr", "src", "/favicon.ico");
    cy.get(".gallery-item").first().find("a").click();
    cy.get(".modal-image").should("have.attr", "src", "/favicon.ico");
    cy.get(".modal-close-btn").click();

    cy.contains("Safe Only").click();
    cy.get(".gallery-item").should("have.length", 2);

    cy.contains("Filters").click();
    cy.get("#subject").type("city");
    cy.get(".gallery-item").should("have.length", 1);

    cy.get("#owner").select("Bob");
    cy.get("#tags").type("night");
    cy.get(".gallery-item").should("have.length", 1);

    cy.contains("Clear filters").click();
    cy.get(".gallery-item").should("have.length", 2);
  });

  it("shows an error state when recent photos fail to load", () => {
    cy.mockFlickrMethod(
      "flickr.photos.getRecent",
      {
        "stat": "fail",
        "code": 502,
        "message": "Failed to fetch data from Flickr."
      },
      "getRecentFailure",
      502
    );

    cy.visit("/recent-photos");
    cy.wait("@getRecentFailure");
    cy.contains("Failed to fetch data from Flickr.").should("be.visible");
    cy.contains("Try again").should("be.visible");
  });
});
