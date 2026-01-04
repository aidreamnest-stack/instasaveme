const express = require("express");
const cors = require("cors");
const app = express();
const snapsave = require("./snapsave-downloader/src/index");
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Instagram Video Downloader API" });
});

app.get("/igdl", async (req, res) => {
  try {
    const url = req.query.url;

    // Check if URL parameter exists
    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Validate URL format
    if (typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Check if it's an Instagram URL
    if (!url.includes('instagram.com')) {
      return res.status(400).json({ error: "URL must be an Instagram link" });
    }

    console.log(`Processing Instagram URL: ${url}`);

    const result = await snapsave(url);
    console.log("Snapsave response:", JSON.stringify(result, null, 2));

    // Check if snapsave returned a valid response
    if (!result || result.status === false) {
      return res.status(400).json({
        error: "Failed to fetch video",
        details: result?.msg || "Unknown error from snapsave"
      });
    }

    // Extract download link from the data array
    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      return res.status(404).json({
        error: "No download links available",
        details: "The snapsave response did not contain any download links"
      });
    }

    // Get the first download link (usually the highest quality)
    const downloadLink = result.data[0].url;
    const thumbnail = result.data[0].thumbnail || null;

    // Return response in expected format
    res.json({
      download_link: downloadLink,
      thumbnail: thumbnail
    });
  } catch (err) {
    console.error("Error processing request:", err.message);
    res.status(500).json({
      error: "Failed to download video",
      details: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
