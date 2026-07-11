describe("navigation", () => {
  it("opens the home, recent photos, and about routes", () => {
    cy.fixture("recent-photos").then((recentPhotos) => {
      cy.mockFlickrMethod("flickr.photos.getRecent", recentPhotos, "getRecent");
    });

    cy.visit("/");
    cy.contains("h1", "Public Flickr Gallery").should("be.visible");
    cy.contains("Discover public photography").should("be.visible");

    cy.contains("Recent Photos").click();
    cy.location("pathname").should("eq", "/recent-photos");
    cy.wait("@getRecent");
    cy.contains("h1", "Recent public photos on Flickr").should("be.visible");

    cy.visit("/about");
    cy.location("pathname").should("eq", "/about");
    cy.contains("h1", "About").should("be.visible");
  });
});
