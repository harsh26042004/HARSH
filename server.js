// Backend: serves /public and stores contact messages in data/messages.json
const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me'; // set a real key before deploying
const FILE = path.join(__dirname, 'data', 'messages.json');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const read = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return []; } };
const lastHit = new Map(); // tiny per-IP rate limit (1 message / 30s)

app.post('/api/contact', (req, res) => {
  const { name = '', email = '', message = '', interest = 'General' } = req.body || {};
  if (name.trim().length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
  if (message.trim().length < 10) return res.status(400).json({ error: 'Message should be at least 10 characters.' });
  const now = Date.now();
  if (now - (lastHit.get(req.ip) || 0) < 30000) return res.status(429).json({ error: 'Please wait a moment before sending again.' });
  lastHit.set(req.ip, now);
  const list = read();
  list.push({ id: now, name: name.trim(), email: email.trim(), interest, message: message.trim(), date: new Date().toISOString() });
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
  res.json({ ok: true });
});

// View messages: GET /api/messages  with header  x-admin-key: <ADMIN_KEY>
app.get('/api/messages', (req, res) => {
  if (req.get('x-admin-key') !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  res.json(read());
});

app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
