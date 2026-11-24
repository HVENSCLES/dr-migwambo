// Dr. Migwambo - a beginner-friendly Express backend
// Run: npm install, then npm start
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware: allow JSON request bodies (we'll use this as we learn APIs)
app.use(express.json());

// Serve our frontend files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// A tiny example API endpoint: visit http://localhost:3000/api/hello
app.get("/api/hello", (req, res) => {
  res.json({ message: "Welcome to Dr. Migwambo! Your server is running. 🌷" });
});

app.listen(PORT, () => {
  console.log(`Dr. Migwambo is running at http://localhost:${PORT}`);
});
