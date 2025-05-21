import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman or Allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);

// Keeps banckend alive
app.get("/healthz", (_, res) => {
  res.status(200).send("OK");
});

// 👉 API route
app.get("/api/flickr", async (req, res) => {
  const params = new URLSearchParams({
    format: "json",
    nojsoncallback: "1",
    api_key: process.env.API_KEY,
  });

  // Predefined fixed parameters
  const fixedKeys = ["format", "nojsoncallback", "api_key"];

  // Append all other parameters from req.query
  for (const [key, value] of Object.entries(req.query)) {
    if (!fixedKeys.includes(key)) {
      params.append(key, value);
    }
  }

  const url = `https://api.flickr.com/services/rest?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data from Flickr" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Express middleware running on http://localhost:${PORT}`);
});
