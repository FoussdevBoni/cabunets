import { Request, Response } from "express";
import User from "../models/User";
import { Vendeur } from "../models/Vendeur";
import {Order} from "../models/Order"; // Importer le modèle Order

// ============================
// GET ALL VENDEURS
// ============================
export const getVendeurs = async (_req: Request, res: Response) => {
  try {
    const vendeurs = await Vendeur.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          "user.password": 0,
        },
      },
    ]);

    const result = vendeurs.map((v) => ({
      _id: v.user._id,
      email: v.user.email,
      role: v.user.role,
      username: v.user.username,
      avatar: v.user.avatar,
      isVerified: v.user.isVerified,
      createdAt: v.user.createdAt,
      updatedAt: v.user.updatedAt,
      whatsappNumber: v.whatsappNumber,
      advantage: v.advantage,
      availability: v.availability,
      paymentAmount: v.paymentAmount,
      photoUrls: v.photoUrls,
      networks: v.networks,
      openingTime: v.openingTime,
      closingTime: v.closingTime,
      isOnline: v.isOnline,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des vendeurs" });
  }
};

// ============================
// UPDATE VENDEUR
// ============================
export const updateVendeur = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { username, avatar, profileData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    let vendeurProfile = null;

    if (user.role === "vendeur" && profileData) {
      const allowedProfileData = {
        whatsappNumber: profileData.whatsappNumber,
        advantage: profileData.advantage,
        availability: profileData.availability,
        paymentAmount: profileData.paymentAmount,
        photoUrls: profileData.photoUrls,
        networks: profileData.networks,
        openingTime: profileData.openingTime,
        closingTime: profileData.closingTime,
        // isOnline sera mis à jour automatiquement par le middleware pre-save
      };

      vendeurProfile = await Vendeur.findByIdAndUpdate(
        user._id,
        { $set: allowedProfileData },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Informations mises à jour avec succès.",
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: vendeurProfile,
      },
    });
  } catch (err) {
    console.error("Erreur update vendeur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================
// DELETE VENDEUR
// ============================
export const deleteVendeur = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const [user] = await Promise.all([
      User.findByIdAndDelete(userId),
      Vendeur.findByIdAndDelete(userId),
    ]);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({ message: "Vendeur supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================
// GET VENDEUR BY ID
// ============================
export const getVendeurById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const profile = await Vendeur.findById(id);

    const {
      whatsappNumber,
      advantage,
      availability,
      paymentAmount,
      photoUrls,
      networks,
      openingTime,
      closingTime,
      isOnline,
    } = profile || {};

    // ============================
    // STATISTIQUES DU VENDEUR
    // ============================
    
    // Récupérer toutes les commandes du vendeur
    const orders = await Order.find({ vendeurId: id });
    
    // Nombre total de ventes
    const totalSales = orders.length;
    
    // Commandes complétées (payées)
    const completedOrders = orders.filter((o: any) => o.status?.toUpperCase() === "COMPLETED" || o.status?.toUpperCase() === "DELIVERED");
    const totalCompletedSales = completedOrders.length;
    
    // Chiffre d'affaires total
    const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.price || 0), 0);
    
    // Chiffre d'affaires du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = completedOrders.filter((o: any) => {
      const orderDate = o.createdAt ? new Date(o.createdAt) : null;
      if (!orderDate) return false;
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
    const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.price || 0), 0);
    
    // Commandes en attente
    const pendingOrders = orders.filter((o: any) => o.status?.toUpperCase() === "PENDING").length;
    
    // Commandes échouées
    const failedOrders = orders.filter((o: any) => o.status?.toUpperCase() === "FAILED").length;
    
    // Taux de réussite (commandes complétées / total)
    const successRate = totalSales > 0 ? Math.round((totalCompletedSales / totalSales) * 100) : 0;
    
    // Déterminer si le vendeur est "Top Vendeur"
    // Critère: plus de 50 commandes complétées OU plus de 5000 FCFA de CA
    const isTopVendeur = totalCompletedSales >= 50 || totalRevenue >= 5000;
    
    // Classement (à calculer en fonction des autres vendeurs si nécessaire)
    let rank = 0;
    if (totalCompletedSales > 0) {
      // Récupérer tous les vendeurs avec leur nombre de commandes complétées
      const allVendeurs = await Vendeur.find({});
      const vendeurStats = await Promise.all(
        allVendeurs.map(async (v) => {
          const vOrders = await Order.find({ 
            vendeurId: v._id,
            status: { $in: ["COMPLETED", "DELIVERED"] }
          });
          return {
            vendeurId: v._id,
            count: vOrders.length,
          };
        })
      );
      
      // Trier par nombre de commandes décroissant
      vendeurStats.sort((a, b) => b.count - a.count);
      
      // Trouver le rang du vendeur actuel
      const index = vendeurStats.findIndex(v => v.vendeurId.toString() === id);
      rank = index !== -1 ? index + 1 : 0;
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      whatsappNumber,
      advantage,
      availability,
      paymentAmount,
      photoUrls,
      networks,
      openingTime,
      closingTime,
      isOnline,
      stats: {
        totalSales,
        totalCompletedSales,
        totalRevenue,
        todayRevenue,
        pendingOrders,
        failedOrders,
        successRate,
        isTopVendeur,
        rank,
      }
    });
  } catch (err) {
    console.error("Erreur récupération vendeur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};