import express from 'express';
import multer from 'multer';
import { 
  uploadStorageConfig, 
  uploadFile, 
  uploadFiles, 
  listFiles 
} from '../controllers/fileController';

const router = express.Router();
const upload = multer({ storage: multer.diskStorage(uploadStorageConfig) });

// Upload simple
router.post('/upload', upload.single('file'), uploadFile);

// Upload multiple fichiers (max 10 fichiers, clé 'files')
router.post('/upload-multiple', upload.array('files', 10), uploadFiles);

// Lister les fichiers
router.get('/list', listFiles);

export default router;
