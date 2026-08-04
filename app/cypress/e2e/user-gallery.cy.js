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

  it("clears the previous gallery while a new username search is loading", () => {
    cy.intercept(
      {
        method: "GET",
        url: "**/api/flickr*",
        query: {
          method: "flickr.people.findByUsername",
          username: "alice",
        },
      },
      {
        statusCode: 200,
        body: {
          stat: "ok",
          user: { id: "alice-user-id" },
        },
      }
    ).as("findAlice");
    cy.fixture("user-gallery").then((gallery) => {
      cy.intercept(
        {
          method: "GET",
          url: "**/api/flickr*",
          query: {
            method: "flickr.people.getPublicPhotos",
            user_id: "alice-user-id",
          },
        },
        {
          statusCode: 200,
          body: gallery,
        }
      ).as("getAlicePhotos");
    });
    cy.intercept(
      {
        method: "GET",
        url: "**/api/flickr*",
        query: {
          method: "flickr.people.findByUsername",
          username: "ubuntu",
        },
      },
      {
        delay: 1000,
        statusCode: 200,
        body: {
          stat: "ok",
          user: { id: "ubuntu-user-id" },
        },
      }
    ).as("findUbuntu");

    cy.visit("/");
    cy.get("input[placeholder='Flickr user name']").type("alice{enter}");
    cy.wait("@findAlice");
    cy.wait("@getAlicePhotos");
    cy.contains("Blue bridge").should("be.visible");

    cy.get("input[placeholder='Flickr user name']").type("ubuntu{enter}");
    cy.contains("Loading... Please wait.").should("be.visible");
    cy.contains("Blue bridge").should("not.exist");
  });
});
