import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import config from '../config';
import { uploadCSV } from '../controllers/upload.controller';

// Ensure upload directory exists
const uploadDir = config.uploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Sanitize filename and add timestamp to avoid collisions
    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_');
    const timestamp = Date.now();
    cb(null, `${timestamp}_${safeName}`);
  }
});

const upload = multer({ storage });
const router = Router();

router.post('/upload-csv', upload.single('file'), uploadCSV);

export default router;