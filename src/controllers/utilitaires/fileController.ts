import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import multer from 'multer';
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;


function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Storage config pour Multer
export const uploadStorageConfig = {
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    let fileType = req.body.fileType || 'others';
    let customPath = req.body.customPath || '';

    fileType = fileType.toLowerCase().replace(/[^a-z]/g, '');
    customPath = customPath
      .split('/')
      .filter(Boolean)
      .map((p: any) => p.replace(/[^a-zA-Z0-9_-]/g, ''))
      .join('/');

    const fullPath = path.join(__dirname, '..', 'uploads', fileType, customPath);
    ensureDirectoryExistence(fullPath);
    cb(null, fullPath);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: any) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
};

// Multer instance pour un fichier
export const uploadSingle = multer({ storage: multer.diskStorage(uploadStorageConfig) }).single('file');

// Multer instance pour plusieurs fichiers
export const uploadMultiple = multer({ storage: multer.diskStorage(uploadStorageConfig) }).array('files', 10); // max 10 fichiers

// Upload d’un fichier
export const uploadFile = (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

  const fileType = req.body.fileType || 'others';
  const customPath = req.body.customPath || '';

  const safeType = fileType.toLowerCase().replace(/[^a-z]/g, '');
  const safePath = customPath.replace(/[^a-zA-Z0-9/_-]/g, '');

  const fileUrl = `${BASE_URL}/uploads/${safeType}/${safePath ? safePath + '/' : ''}${req.file.filename}`;

  res.status(200).json({ url: fileUrl });
};

// Upload multiple fichiers
export const uploadFiles = (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }

  const fileType = req.body.fileType || 'others';
  const customPath = req.body.customPath || '';

  const safeType = fileType.toLowerCase().replace(/[^a-z]/g, '');
  const safePath = customPath.replace(/[^a-zA-Z0-9/_-]/g, '');

  const files = (req.files as Express.Multer.File[]).map(file => ({
    filename: file.filename,
    url: `${BASE_URL}/uploads/${safeType}/${safePath ? safePath + '/' : ''}${file.filename}`,
  }));

  res.status(200).json({ files });
};

// Lister les fichiers
export const listFiles = async (req: Request, res: Response) => {
  const fileType = (req.query.fileType as string)?.toLowerCase() || 'others';
  const customPath = (req.query.customPath as string) || '';

  const safeType = fileType.replace(/[^a-z]/g, '');
  const safePath = customPath.replace(/[^a-zA-Z0-9/_-]/g, '');

  const basePath = path.join(__dirname, '..', 'uploads', safeType, safePath);

  try {
    const files = await fsPromises.readdir(basePath);
    const fileInfos = files.map((filename) => ({
      filename,
      url: `${BASE_URL}/uploads/${safeType}/${safePath ? safePath + '/' : ''}${filename}`,
    }));
    res.json(fileInfos);
  } catch (err) {
    return res.status(404).json({ error: 'Dossier introuvable ou vide' });
  }
};
