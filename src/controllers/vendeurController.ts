import { Request, Response } from "express";
import User from "../models/User";
import { Vendeur } from "../models/Vendeur";

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
    } = profile || {};

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
    });
  } catch (err) {
    console.error("Erreur récupération vendeur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

