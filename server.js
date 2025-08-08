const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });
const ADMIN_PASS = "admin123"; // change this

app.post('/upload', upload.single('screenshot'), (req, res) => {
  const file = req.file;
  const newName = `user-${Date.now()}.png`;
  fs.renameSync(file.path, `uploads/${newName}`);
  fs.writeFileSync(`statuses/${newName}.json`, JSON.stringify({ status: "pending" }));
  res.send(`<p>Uploaded! File name: ${newName}</p><a href="/status.html">Check status</a>`);
});

app.get('/admin', (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.json({ error: "Wrong password" });
  const files = fs.readdirSync('uploads').filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  res.json({ files });
});

app.post('/set-status', (req, res) => {
  const { file, status, pass } = req.body;
  if (pass !== ADMIN_PASS) return res.status(403).send("Invalid password");
  fs.writeFileSync(`statuses/${file}.json`, JSON.stringify({ status }));
  res.send("OK");
});

app.get('/status/:file', (req, res) => {
  const file = req.params.file;
  const statusPath = `statuses/${file}.json`;
  if (!fs.existsSync(statusPath)) return res.json({ status: "pending" });
  const data = JSON.parse(fs.readFileSync(statusPath));
  res.json(data);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
