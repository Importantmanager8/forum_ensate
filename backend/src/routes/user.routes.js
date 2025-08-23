import express from 'express';
import User from '../models/user.model.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/cv';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
  }
});

// Get all users
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload CV file
router.post('/cv/upload', authenticate, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
 
    // Delete old CV file if exists
    const user = await User.findById(req.user._id);
    if (user.cvFile && user.cvFile.filename) {
      const oldFilePath = path.join('uploads/cv', user.cvFile.filename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user with new CV information
    const cvFileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date()
    };

    await User.findByIdAndUpdate(req.user._id, { cvFile: cvFileInfo });

    res.json({
      message: 'CV uploaded successfully',
      cvFile: cvFileInfo
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Download CV file
router.get('/cv/download/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.cvFile || !user.cvFile.filename) {
      return res.status(404).json({ message: 'CV not found' });
    }

    const filePath = path.join('uploads/cv', user.cvFile.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'CV file not found' });
    }

    res.download(filePath, user.cvFile.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete CV
router.delete('/cv/delete', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.cvFile || !user.cvFile.filename) {
      return res.status(404).json({ message: 'No CV found' });
    }

    // Delete file from filesystem
    const filePath = path.join('uploads/cv', user.cvFile.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove CV info from user
    await User.findByIdAndUpdate(req.user._id, { $unset: { cvFile: 1 } });

    res.json({ message: 'CV deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user's CV info
router.get('/cv/info', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('cvFile');
    res.json({ cvFile: user.cvFile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;