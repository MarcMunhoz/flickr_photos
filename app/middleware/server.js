import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { buildFlickrProxyResponse } from "../src/api/flickrProxy.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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
  const { status, body } = await buildFlickrProxyResponse({
    searchParams: req.query,
    apiKey: process.env.API_KEY,
    fetchImpl: fetch,
  });

  res.status(status).json(body);
});

app.listen(PORT, () => {
  console.log(`Express middleware running on http://localhost:${PORT}`);
});
