import express from 'express';

import {  updateUser, deleteUser } from '../../controllers/metier/userController';
import { confirmUser, getUserProfile, login, register, requestPasswordReset, resetPasswordWithOtp } from '../../controllers/metier/authController';
import { authMiddleware } from '../../middlewares/authMiddleware';

import { accountOwner } from '../../middlewares/accountOwner';
const router = express.Router();

router.post('/register' , register);
router.post('/confirm' , confirmUser);
router.post('/login', login);
router.post('/request-reset-password', requestPasswordReset );
router.post('/reset-password', resetPasswordWithOtp );

router.put('/:id', authMiddleware, accountOwner, updateUser);
router.delete('/:id', authMiddleware, accountOwner, deleteUser);
router.get("/me", authMiddleware, getUserProfile);



export default router;
