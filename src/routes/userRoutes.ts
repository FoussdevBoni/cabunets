import express from 'express';
import { deleteUser, getUserById, getUsers } from '../controllers/userController';
import { updateUserData } from '../controllers/authController';



const router = express.Router();

// Routes pour les Companie
router.get('/', getUsers);
router.get('/:id', getUserById);

router.put('/:id', updateUserData);
router.delete('/:id', deleteUser);

export default router;
