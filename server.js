const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON & form parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/approved', express.static(path.join(__dirname, 'approved')));
app.use('/declined', express.static(path.join(__dirname, 'declined')));
app.use('/', express.static(__dirname)); // serve index.html etc.

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Upload screenshot
app.post("/upload", upload.single("screenshot"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  res.send("Uploaded");
});

// Return list of uploaded screenshots
app.get("/list", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).json([]);
    res.json(files);
  });
});

// Approve
app.post("/approve", (req, res) => {
  const { filename } = req.body;
  fs.rename(`uploads/${filename}`, `approved/${filename}`, (err) => {
    if (err) return res.status(500).send("Failed");
    res.send("Approved");
  });
});

// Decline
app.post("/decline", (req, res) => {
  const { filename } = req.body;
  fs.rename(`uploads/${filename}`, `declined/${filename}`, (err) => {
    if (err) return res.status(500).send("Failed");
    res.send("Declined");
  });
});

// Serve QR/data info
app.get("/data.json", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading data.json");
    res.type("application/json").send(data);
  });
});

// Update QR/payment/code/zoom from admin
app.post("/update-data", (req, res) => {
  const newData = req.body;
  fs.writeFile("data.json", JSON.stringify(newData, null, 2), (err) => {
    if (err) return res.status(500).send("Failed to update");
    res.send("Updated");
  });
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
