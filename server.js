const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/approved", express.static("approved"));
app.use("/declined", express.static("declined"));

const upload = multer({ dest: "uploads/" });

// Upload screenshot
app.post("/upload", upload.single("screenshot"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  res.status(200).send("File uploaded");
});

// Approve
app.post("/approve/:filename", (req, res) => {
  const file = req.params.filename;
  const oldPath = path.join(__dirname, "uploads", file);
  const newPath = path.join(__dirname, "approved", file);
  fs.rename(oldPath, newPath, err => {
    if (err) return res.status(500).send("Error approving file");
    res.send("Approved");
  });
});

// Decline
app.post("/decline/:filename", (req, res) => {
  const file = req.params.filename;
  const oldPath = path.join(__dirname, "uploads", file);
  const newPath = path.join(__dirname, "declined", file);
  fs.rename(oldPath, newPath, err => {
    if (err) return res.status(500).send("Error declining file");
    res.send("Declined");
  });
});

// Get pending uploads
app.get("/pending", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).json([]);
    res.json(files);
  });
});

// Get approved uploads
app.get("/approved-list", (req, res) => {
  fs.readdir("approved", (err, files) => {
    if (err) return res.status(500).json([]);
    res.json(files.map(f => ({ filename: f, approved: true })));
  });
});

// Get current Zoom info + code
app.get("/data", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading data");
    res.json(JSON.parse(data));
  });
});

// Update Zoom ID + code
app.post("/update-data", (req, res) => {
  fs.writeFile("data.json", JSON.stringify(req.body), err => {
    if (err) return res.status(500).send("Error saving data");
    res.send("Data updated");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
