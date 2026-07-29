import { Router } from 'express';
import userRoutes from './userRoutes'
import authRoute from './authRoutes'
import offreRoutes from './offreRoutes'
import vendeurRoutes from './vendeurRoutes'
import orderRoutes from './orderRoutes'
import uploadRoutes from './uploadRoutes'
import paymentRoutes from './paymentRoutes'


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










  



export default router;
