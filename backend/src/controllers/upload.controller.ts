import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.CSV_UPLOAD_DIR || path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true, mode: 0o755 });
}

export const uploadCSV = (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const absolutePath = path.resolve(req.file.path);
    res.json({ filePath: absolutePath });
  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};