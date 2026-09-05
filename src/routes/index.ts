import { Router } from 'express';
import userRoutes from './userRoutes'
import authRoute from './authRoutes'
import offreRoutes from './offreRoutes'
import vendeurRoutes from './vendeurRoutes'
import orderRoutes from './orderRoutes'
import uploadRoutes from './uploadRoutes'
import paymentRoutes from './paymentRoutes'
import retraitRoutes from './retraitRoutes'
import reclamationRoutes from './reclamationRoutes'
import walletRoutes from './walletRoutes'
import settingsRoutes from './settingsRoutes'
import notificationRoutes from './notificationRoutes'

// Création de l'instance du routeur
const router = Router();

// Définition des chemins d'API et attribution des routes

router.use('/auth', authRoute);
router.use('/users', userRoutes);
router.use('/vendeurs', vendeurRoutes);
router.use('/offres', offreRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/retraits', retraitRoutes);
router.use('/reclamations', reclamationRoutes);
router.use('/settings', settingsRoutes);
router.use('/wallet', walletRoutes);
router.use('/notifications', notificationRoutes);











  



export default router;
