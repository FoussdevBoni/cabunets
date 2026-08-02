import { Request, Response } from 'express';
import User from '../models/User';
import { register } from './authController';
import { Vendeur } from '../models/Vendeur';
import { Client } from '../models/Client';

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await register(req , res)
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création du user', details: err });
  }
};



export const getUsers = async (req: Request, res: Response) => {
  try {
    const { day, week, month, year, ...filters } = req.query;

    let query: any = { ...filters }; // filtres dynamiques (role=admin, email=..., etc.)

    // Gestion du filtre temporel
    if (day || week || month || year) {
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = null;

      if (day) {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (week) {
        const dayOfWeek = now.getDay(); // 0 = dimanche
        start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);

        end = new Date(start);
        end.setDate(start.getDate() + 7);
      } else if (month) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else if (year) {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
      }

      if (start && end) {
        query.createdAt = { $gte: start, $lt: end };
      }
    }

    const users = await User.find(query);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des users" });
  }
};




export const getUserById = async (req: Request, res: Response) => {
  try {
  

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User introuvable." });
    }

    // Récupération des infos selon le rôle
    let roleInfo: any = null;
    switch (user.role) {
   
       case "vendeur":
        roleInfo = await Vendeur.findOne({ _id: user._id });
        break;
      default:
        roleInfo = null;
    }


    res.status(200).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: roleInfo,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { username, avatar , profileData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    /* ======================
       UPDATE USER
    ======================= */

    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    /* ======================
       UPDATE PROFIL PARTICULIER
    ======================= */

    let profile = null;

    if (user.role === "vendeur" && profileData) {
      profile = await Vendeur.findByIdAndUpdate(
        user._id,
        { $set: profileData },
        { new: true }
      );
    }

     if (user.role === "client" && profileData) {
      profile = await Client.findByIdAndUpdate(
        user._id,
        { $set: profileData },
        { new: true }
      );
    }

    
    res.status(200).json({
      message: "Informations mises à jour avec succès.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    console.error("Erreur update user :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User non trouvé' });
    res.json({ message: 'User supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du user' });
  }
};


export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password"); // ne pas renvoyer le mot de passe
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};
