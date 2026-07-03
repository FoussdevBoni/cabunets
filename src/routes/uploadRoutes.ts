// routes/uploadRoutes.ts
import express, { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadFile, deleteFile, uploadMultipleFiles } from '../controllers/uploadController';

const router: Router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload simple (existant)
router.post('/', authMiddleware, upload.single('file'), uploadFile);

// Upload multiple avec streaming pour la progression
router.post('/multiple', authMiddleware, upload.array('files', 10), uploadMultipleFiles);

// Suppression
router.delete('/', authMiddleware, deleteFile);

export default router;