const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Setup file upload for QR image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'qr.jpg'); // always overwrite as qr.jpg
  }
});
const upload = multer({ storage: storage });

// 📤 Admin Save Route
app.post('/admin/save', upload.single('qr'), (req, res) => {
  const {
    amount,
    zoomId,
    zoomPass,
    codeStart,
    codeEnd
  } = req.body;

  const data = {
    qrImage: 'qr.jpg',
    amount: parseInt(amount),
    zoomId,
    zoomPass,
    codeStart,
    codeEnd
  };

  fs.writeFile('data.json', JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error('❌ Error writing data.json:', err);
      return res.status(500).send('Failed to save data');
    }
    res.send('✅ Settings saved successfully!');
  });
});

// 📥 User Data Load Route
app.get('/data', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Error reading data.json:', err);
      return res.status(500).send('Failed to read data');
    }
    res.json(JSON.parse(data));
  });
});

// ✅ Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
