import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

export const uploadRouter = Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch {}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// Admin upload single image
uploadRouter.post('/', authenticateToken, requireAdmin, upload.single('image'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file uploaded.' });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `img-${uniqueSuffix}${ext}`;
    let fileUrl = '';

    // Attempt to write to disk if uploads directory is writable
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const targetPath = path.join(uploadsDir, filename);
      fs.writeFileSync(targetPath, req.file.buffer);
      fileUrl = `/uploads/${filename}`;
    } catch (diskErr) {
      // In serverless / read-only filesystem, use base64 data URL so upload never fails
      fileUrl = `data:${req.file.mimetype || 'image/png'};base64,${req.file.buffer.toString('base64')}`;
    }

    res.json({
      url: fileUrl,
      filename,
      size: req.file.size
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'File upload failed.' });
  }
});

// Admin upload multiple images
uploadRouter.post('/multiple', authenticateToken, requireAdmin, upload.array('images', 8), (req: AuthenticatedRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No images uploaded.' });
      return;
    }

    const uploaded = files.map(f => {
      const ext = path.extname(f.originalname).toLowerCase() || '.png';
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `img-${uniqueSuffix}${ext}`;
      let fileUrl = '';

      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const targetPath = path.join(uploadsDir, filename);
        fs.writeFileSync(targetPath, f.buffer);
        fileUrl = `/uploads/${filename}`;
      } catch {
        fileUrl = `data:${f.mimetype || 'image/png'};base64,${f.buffer.toString('base64')}`;
      }

      return {
        url: fileUrl,
        filename,
        size: f.size
      };
    });

    res.json({ files: uploaded });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Multiple upload failed.' });
  }
});
