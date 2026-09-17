const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'healing-roots-videos',
    resource_type: 'auto',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm']
  }
});
const upload = multer({ storage: storage });

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: { type: String, default: 'patient-review' },
  videoUrl: String,
  publicId: String,
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const newVideo = new Video({
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      category: req.body.category || 'patient-review',
      videoUrl: req.file.path,
      publicId: req.file.filename
    });

    await newVideo.save();
    res.json({ message: 'Video uploaded successfully!', video: newVideo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload video', details: err.message });
  }
});

app.delete('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.publicId) {
      await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete video', details: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://healingroots:RwprfBx11vCPm0E9@cluster0.xc0oab3.mongodb.net/videoApp?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Database connected successfully!');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });