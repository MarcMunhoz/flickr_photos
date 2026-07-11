describe("public user gallery", () => {
  it("loads public photos for a Flickr username", () => {
    cy.fixture("flickr-user").then((user) => {
      cy.mockFlickrMethod("flickr.people.findByUsername", user, "findByUsername");
    });
    cy.fixture("user-gallery").then((gallery) => {
      cy.mockFlickrMethod("flickr.people.getPublicPhotos", gallery, "getPublicPhotos");
    });

    cy.visit("/");
    cy.get("input[placeholder='Flickr user name']").type("alice{enter}");

    cy.wait("@findByUsername");
    cy.wait("@getPublicPhotos");
    cy.contains("Photos by Alice on Flickr - Page 1 of 1").should("be.visible");
    cy.contains("Blue bridge").should("be.visible");
    cy.contains("Evening skyline").should("be.visible");
  });

  it("shows a deterministic Flickr failure message", () => {
    cy.mockFlickrMethod(
      "flickr.people.findByUsername",
      {
        "stat": "fail",
        "code": 1,
        "message": "User not found"
      },
      "findByUsername"
    );

    cy.visit("/");
    cy.get("input[placeholder='Flickr user name']").type("missing{enter}");

    cy.wait("@findByUsername");
    cy.contains("User not found").should("be.visible");
  });
});
