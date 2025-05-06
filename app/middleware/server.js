import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 👉 API route
app.get("/api/flickr", async (req, res) => {
  const params = new URLSearchParams({
    ...req.query,
    api_key: process.env.VITE_API_KEY,
    format: "json",
    nojsoncallback: "1",
  });

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

// 👉 Serve frontend se houver build (produção)
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

// SPA fallback
app.get("*", (_, res) => {
  res.sendFile(path.resolve(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Express middleware running on http://localhost:${PORT}`);
});
