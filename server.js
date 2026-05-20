    app.get("/:code", async (req, res) => {

  // ignore favicon
  if (req.params.code === "favicon.ico") {
    return res.status(204).end();
  }

  const link = await Link.findOne({
    shortCode: req.params.code
  });

  if (!link) {
    return res.send("Link not found");
  }

  link.clicks++;
  await link.save();

  return res.redirect(link.originalUrl);
});
