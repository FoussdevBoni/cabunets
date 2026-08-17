import express from 'express';
import { 
  deleteUser, 
  getUserById, 
  getUsers, 
  verifyUser,
  toggleUserStatus 
} from '../controllers/userController';
import { updateUserData } from '../controllers/authController';

const router = express.Router();

// Routes pour les utilisateurs
router.get('/', getUsers);
router.get('/:id', getUserById);

router.put('/:id', updateUserData);
router.patch('/:id/verify', verifyUser); // Route pour vérifier un utilisateur
router.patch('/:id/toggle-status', toggleUserStatus); // Route pour activer/désactiver un compte
router.delete('/:id', deleteUser);

export default router;