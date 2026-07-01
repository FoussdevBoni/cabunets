import express from 'express';

import {  updateUser, deleteUser } from '../controllers/userController';
import { confirmUser, getUserProfile, login, register, requestPasswordReset, resetPasswordWithOtp } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register' , register);
router.post('/confirm' , confirmUser);
router.post('/login', login);
router.post('/request-reset-password', requestPasswordReset );
router.post('/reset-password', resetPasswordWithOtp );

router.put('/:id', updateUser);
router.delete('/:id' , deleteUser);
router.get("/me", authMiddleware, getUserProfile);



export default router;
