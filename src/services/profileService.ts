// services/profileService.ts
import crypto from "crypto";
import { IUser } from "../models/User";
import { IClient, Client } from "../models/Client";
import { IVendeur, Vendeur } from "../models/Vendeur";
import { Admin, IAdmin } from "../models/Admin";
import mongoose from "mongoose";

type ProfileData = IVendeur | IClient | IAdmin

interface UserData {
    email: string;
    avatar?: string,
    username: string;
    role: IUser["role"]
}
interface CreateProfileParams {
    userId: string;
    profileData?: ProfileData;
    userData: UserData;
}

interface UpdateProfileParams {
    profileId: string;  // ← ID du Profile
    profileData: Partial<ProfileData>;
    userData: Partial<UserData>
}

class ProfileService {
 

    async getProfileByRole(role: IUser['role'], userId: string): Promise<any | null> {
        try {
            if (role === "admin") {
                return await Admin.findOne({ _id: userId });
            }
            else if (role === "client") {
                return await Client.findOne({  _id: userId });
            }
            else if (role === "vendeur") {
                return await Vendeur.findOne({  _id: userId });
            }
            return null;
        } catch (error) {
            console.error("Error getting profile:", error);
            return null;
        }
    }

    async getProfileById(profileId: string, role: IUser['role']): Promise<any | null> {
        
        try {
            if (role === "admin") {
                return await Admin.findById(profileId);
            }
            else if (role === "client") {
                return await Client.findById(profileId);
            }
            else if (role === "vendeur") {
                return await Vendeur.findById(profileId);
            }
            return null;
        } catch (error) {
            console.error("Error getting profile by id:", error);
            return null;
        }
    }

 
    async profileExists(role: IUser['role'], userId: string): Promise<boolean> {
        try {
            const profile = await this.getProfileByRole(role, userId);
            return !!profile;
        } catch (error) {
            console.error("Error checking profile existence:", error);
            return false;
        }
    }
}

export const profileService = new ProfileService();