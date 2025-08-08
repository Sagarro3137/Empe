const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const APPROVED_DIR = path.join(__dirname, 'approved');
const DECLINED_DIR = path.join(__dirname, 'declined');

[UPLOADS_DIR, APPROVED_DIR, DECLINED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Receive UTR from frontend
app.post('/upload', (req, res) => {
  const { utr } = req.body;
  if (!utr) return res.status(400).json({ error: 'UTR is required' });

  const timestamp = Date.now();
  const filePath = path.join(UPLOADS_DIR, `${timestamp}.txt`);
  fs.writeFileSync(filePath, utr);
  res.status(200).json({ message: 'UTR saved' });
});

// List all UTRs for admin panel
app.get('/list', (req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR);
  const data = files.map(file => ({
    filename: file,
    utr: fs.readFileSync(path.join(UPLOADS_DIR, file), 'utf-8')
  }));
  res.json(data);
});

// Approve UTR
app.post('/approve', (req, res) => {
  const { filename } = req.body;
  const oldPath = path.join(UPLOADS_DIR, filename);
  const newPath = path.join(APPROVED_DIR, filename);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    res.json({ message: 'Approved' });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Decline UTR
app.post('/decline', (req, res) => {
  const { filename } = req.body;
  const oldPath = path.join(UPLOADS_DIR, filename);
  const newPath = path.join(DECLINED_DIR, filename);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    res.json({ message: 'Declined' });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
