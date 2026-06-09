import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const flickrApiKey = (process.env.API_KEY || "").trim().replace(/^['"]|['"]$/g, "");
// Keep the private API key from becoming a general-purpose Flickr proxy.
const allowedMethods = new Set([
  "flickr.people.findByUsername",
  "flickr.people.getPublicPhotos",
  "flickr.photos.getRecent",
]);

app.use(
  cors({
    origin: function (origin, callback) {
      // Requests without an Origin header support health checks and local API clients.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);

app.get("/healthz", (_, res) => {
  res.status(200).send("OK");
});

app.get("/api/flickr", async (req, res) => {
  if (!flickrApiKey) {
    return res.status(500).json({
      stat: "fail",
      code: 500,
      message: "Missing Flickr API key. Set API_KEY in environment.",
    });
  }

  if (!allowedMethods.has(req.query.method)) {
    return res.status(400).json({
      stat: "fail",
      code: 400,
      message: "Unsupported Flickr method.",
    });
  }

  const params = new URLSearchParams({
    format: "json",
    nojsoncallback: "1",
    api_key: flickrApiKey,
  });

  const fixedKeys = ["format", "nojsoncallback", "api_key"];

  // Client parameters are forwarded, but fixed proxy credentials cannot be overridden.
  for (const [key, value] of Object.entries(req.query)) {
    if (!fixedKeys.includes(key)) {
      params.append(key, String(value));
    }
  }

  const url = `https://api.flickr.com/services/rest?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        stat: "fail",
        code: response.status,
        message: "Flickr request failed.",
      });
    }

    res.status(data.stat === "fail" ? 400 : 200).json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({
      stat: "fail",
      code: 502,
      message: "Failed to fetch data from Flickr.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Express middleware running on http://localhost:${PORT}`);
});
