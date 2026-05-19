const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// MongoDB connect
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// Schema
const LinkSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String,
  clicks: { type: Number, default: 0 }
});

// IMPORTANT: index for speed
LinkSchema.index({ shortCode: 1 });

const Link = mongoose.model("Link", LinkSchema);

/* =========================
   AUTO SHORT LINK
========================= */
app.post("/shorten", async (req, res) => {
  const { url } = req.body;

  const shortCode = shortid.generate();

  const newLink = new Link({
    originalUrl: url,
    shortCode
  });

  await newLink.save();

  res.json({
    shortUrl: `${req.headers.host}/${shortCode}`
  });
});

/* =========================
   CUSTOM LINK CREATOR
========================= */
app.post("/create-custom", async (req, res) => {
  const { code, url } = req.body;

  if (!code || !url) {
    return res.send("Missing code or url");
  }

  const existing = await Link.findOne({ shortCode: code });

  if (existing) {
    return res.send("Custom code already exists");
  }

  const newLink = new Link({
    originalUrl: url,
    shortCode: code
  });

  await newLink.save();

  res.json({
    message: "Custom link created",
    shortLink: `${req.headers.host}/${code}`
  });
});

/* =========================
   REDIRECT + CLICK TRACK
========================= */
app.get("/:code", async (req, res) => {
  const link = await Link.findOne({ shortCode: req.params.code });

  if (!link) {
    return res.send("Link not found");
  }

  // increase clicks
  link.clicks++;
  await link.save();

  return res.redirect(link.originalUrl);
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
