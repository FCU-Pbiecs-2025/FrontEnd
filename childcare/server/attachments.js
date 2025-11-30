// Handles file uploads for application attachments
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/attachments');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST /api/applications/:id/attachments
router.post('/api/applications/:id/attachments', upload.array('attachments', 4), async (req, res) => {
  try {
    const applicationId = req.params.id;
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    // Build file paths for up to 4 attachments
    const attachmentPaths = files.map(f => `/uploads/attachments/${f.filename}`);
    // Pad to 4
    while (attachmentPaths.length < 4) attachmentPaths.push(null);
    // TODO: Update the applications table in your DB here
    // Example: await db.updateApplicationAttachments(applicationId, ...attachmentPaths);
    res.json({ success: true, attachmentPaths });
  } catch (error) {
    console.error('Attachment upload error:', error);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
});

export default router;

