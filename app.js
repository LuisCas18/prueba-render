const express = require("express");
const metascraper = require("metascraper");
const description = require("metascraper-description");
const image = require("metascraper-image");
const title = require("metascraper-title");
const urlMetadata = require("metascraper-url");
const mediaProvider = require("metascraper-media-provider");
const iframe = require("metascraper-iframe");
const axios = require("axios");

const scraper = metascraper([
  iframe(),
  mediaProvider(),
  description(),
  image(),
  title(),
  urlMetadata(),
]);

const app = express();
app.use(express.json());

app.post("/linkpreview", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.json({ success: false, error: "Missing URL" });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    
    const contentType = response.headers["content-type"] || "text/html";
    const metadata = await scraper({
      html: response.data,
      url,
    });

    return res.json({
      success: true,
       result: {
          mimetype: contentType,
          siteData: {
            url: metadata.url,
            title: metadata.title,
            description: metadata.description,
            image: metadata.image
          }
        }
      });
  } catch (err) {
    return res.json({
      success: false,
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
