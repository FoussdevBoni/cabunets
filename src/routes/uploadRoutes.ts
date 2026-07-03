// routes/uploadRoutes.ts
import express, { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadFile, deleteFile } from '../controllers/uploadController';

const router: Router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, upload.single('file'), uploadFile);
router.delete('/', authMiddleware, deleteFile);

export default router;