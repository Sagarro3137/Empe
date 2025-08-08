const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = "admin123"; // ✅ Change if needed

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Ensure folders exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("statuses")) fs.mkdirSync("statuses");

// File Upload Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Routes

// Homepage route (optional)
app.get("/", (req, res) => {
  res.send("✅ QR Pay backend is running!");
});

// Upload route
app.post("/upload", upload.single("screenshot"), (req, res) => {
  const user = req.body.user || "unknown";
  const filename = req.file.filename;

  fs.writeFileSync(`statuses/${filename}.txt`, "pending");
  res.send(`
    <h2>Upload received ✅</h2>
    <p>Screenshot: <strong>${filename}</strong></p>
    <p>Check status here:</p>
    <a href="/status/${filename}" target="_blank">Status Page</a>
  `);
});

// Admin panel fetch
app.get("/admin", (req, res) => {
  const pass = req.query.pass;
  if (pass !== ADMIN_PASSWORD) {
    return res.json({ error: "Invalid password" });
  }

  fs.readdir("uploads", (err, files) => {
    if (err) return res.json({ error: "Upload folder error" });
    res.json({ files });
  });
});

// Approve
app.post("/approve", (req, res) => {
  const { filename, pass } = req.body;
  if (pass !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  fs.writeFileSync(`statuses/${filename}.txt`, "approved");
  res.json({ message: "✅ Approved" });
});

// Reject
app.post("/reject", (req, res) => {
  const { filename, pass } = req.body;
  if (pass !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  fs.writeFileSync(`statuses/${filename}.txt`, "rejected");
  res.json({ message: "❌ Rejected" });
});

// Status checker
app.get("/status/:filename", (req, res) => {
  const filename = req.params.filename;
  const statusPath = `statuses/${filename}.txt`;

  if (!fs.existsSync(statusPath)) {
    return res.send(`<h3>Status not found for ${filename}</h3>`);
  }

  const status = fs.readFileSync(statusPath, "utf-8");
  res.send(`
    <h2>Status for: ${filename}</h2>
    <p><strong>Status:</strong> ${status}</p>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
