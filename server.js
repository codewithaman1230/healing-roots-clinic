const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Static files and uploads folder (public folder check fix)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.deployTimestamp || (Date.now() + '-' + file.originalname));
  }
});
// Fixed timestamp key safety
const safeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: safeStorage });

// Mongoose Schema & Model
const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: { type: String, default: 'patient-review' }, 
  videoUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

// 1. Get All Videos
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// 2. Upload Video
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const newVideo = new Video({
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      category: req.body.category || 'patient-review',
      videoUrl: `/uploads/${req.file.filename}`
    });

    await newVideo.save();
    res.json({ message: 'Video uploaded successfully!', video: newVideo });
  } catch (err) {
    res.status(550).json({ error: 'Failed to upload video', details: err.message });
  }
});

// 3. Delete Video API
app.delete('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const filePath = path.join(__dirname, video.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Fallback route to serve index.html for SPA/multi-page static routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database Connection & Server Start (Cloud MongoDB URI support)
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://healingroots:RwprfBx11vCPmOE9@cluster0.xc0oab3.mongodb.net/videoApp?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Database connected successfully!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });