// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 7071;

// Store this securely (Azure Key Vault / app settings)
const DIRECT_LINE_SECRET = process.env.DIRECT_LINE_SECRET;

// Standard Direct Line endpoint (if you're using Direct Line channel)
// If you're using Direct Line App Service Extension, your endpoint differs (see MS docs).
const DIRECT_LINE_TOKEN_URL = "https://directline.botframework.com/v3/directline/tokens/generate";

app.get("/api/directline/token", async (req, res) => {
  try {
    const r = await fetch(DIRECT_LINE_TOKEN_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${DIRECT_LINE_SECRET}` }
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).send(text);
    }

    const data = await r.json(); // { token: "...", expires_in: ... }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log(`Token server running on ${PORT}`));
