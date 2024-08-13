const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https'); // Add this line to require the https module

const app = express();
const PORT = process.env.PORT || 3000;

// Define the base path where files will be uploaded
const BASE_PATH = path.join(__dirname, 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(BASE_PATH)) {
  fs.mkdirSync(BASE_PATH, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, BASE_PATH);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Save file with original name
  }
});

// Configure multer middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000000 }, // Limit file size to 500MB
  fileFilter: function (req, file, cb) {
    // Only allow certain file types
    const filetypes = /jpg|jpeg|png|gif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed!'));
    }
  }
});

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully!');
});

app.get('/healthcheck', (req, res) => {
  res.send('okk');
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send(err.message);
  }
});

// Load SSL certificate and key
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start the HTTPS server
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server is running on port ${PORT}`);
});
