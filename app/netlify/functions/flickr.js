import { buildFlickrProxyResponse } from "../../src/api/flickrProxy.js";

export default async (request) => {
  if (request.method !== "GET") {
    return Response.json(
      {
        stat: "fail",
        code: 405,
        message: "Method not allowed.",
      },
      {
        status: 405,
        headers: {
          Allow: "GET",
        },
      }
    );
  }

  const url = new URL(request.url);
  const { status, body } = await buildFlickrProxyResponse({
    searchParams: url.searchParams,
    apiKey: process.env.API_KEY,
    fetchImpl: fetch,
  });

  return Response.json(body, { status });
};

export const config = {
  path: "/api/flickr",
};
