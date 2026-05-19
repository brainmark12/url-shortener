const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Schema
const LinkSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String
});

const Link = mongoose.model("Link", LinkSchema);

// Create short link
app.post("/shorten", async (req, res) => {
  const { url } = req.body;

  const shortCode = shortid.generate();

  const newLink = new Link({ originalUrl: url, shortCode });
  await newLink.save();

  res.json({
    shortUrl: `${req.headers.host}/${shortCode}`
  });
});

// Redirect
app.get("/:code", async (req, res) => {
  const link = await Link.findOne({ shortCode: req.params.code });

  if (link) {
    res.redirect(link.originalUrl);
  } else {
    res.send("Link not found");
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
