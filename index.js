const express = require('express');
const app = express();
const { createClient } = require('redis');
const crypto = require('crypto');
require('dotenv').config();

const client = createClient({ url: process.env.REDIS_URL });
client.connect();

app.use(express.json());

app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const code = crypto.randomBytes(3).toString('hex');
  await client.set(`short:${code}`, url);

  res.json({ short_url: `${process.env.BASE_URL}/${code}` });
});

app.get('/:code', async (req, res) => {
  const { code } = req.params;
  const originalUrl = await client.get(`short:${code}`);

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send('Short URL not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));