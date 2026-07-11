const flickrApi = "**/api/flickr*";

Cypress.Commands.add("mockFlickrMethod", (method, response, alias, statusCode = 200) => {
  cy.intercept(
    {
      method: "GET",
      url: flickrApi,
      query: {
        method,
      },
    },
    {
      statusCode,
      body: response,
    }
  ).as(alias);
});
