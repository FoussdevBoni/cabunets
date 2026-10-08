// services/vendeurService.ts
import User from "../models/User";
import { Vendeur } from "../models/Vendeur";
import { Order } from "../models/Order";
import { computeIsOnline } from "../utils/isVendeurOnline";

export const vendeurService = {
    // ============================
    // GET ALL VENDEURS
    // ============================
    async getAllVendeurs() {
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
            { $project: { "user.password": 0 } },
        ]);

        return vendeurs.map((v) => ({
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
            // ✅ Recalculé à la volée, jamais lu depuis la base
            isOnline: computeIsOnline(v.openingTime, v.closingTime),
        }));
    },

    // ============================
    // GET VENDEUR BY ID (+ stats)
    // ============================
    async getVendeurById(id: string) {
        const user = await User.findById(id).select("-password");
        if (!user) return null;

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
        } = profile || {};

        // ============================
        // STATISTIQUES DU VENDEUR
        // ============================
        const orders = await Order.find({ vendeurId: id });

        const totalSales = orders.length;

        const completedOrders = orders.filter(
            (o: any) =>
                o.status?.toUpperCase() === "COMPLETED" ||
                o.status?.toUpperCase() === "DELIVERED"
        );
        const totalCompletedSales = completedOrders.length;

        const totalRevenue = completedOrders.reduce(
            (sum: number, o: any) => sum + (o.price || 0),
            0
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = completedOrders.filter((o: any) => {
            const orderDate = o.createdAt ? new Date(o.createdAt) : null;
            if (!orderDate) return false;
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        });
        const todayRevenue = todayOrders.reduce(
            (sum: number, o: any) => sum + (o.price || 0),
            0
        );

        const pendingOrders = orders.filter(
            (o: any) => o.status?.toUpperCase() === "PENDING"
        ).length;

        const failedOrders = orders.filter(
            (o: any) => o.status?.toUpperCase() === "FAILED"
        ).length;

        const successRate =
            totalSales > 0
                ? Math.round((totalCompletedSales / totalSales) * 100)
                : 0;

        const isTopVendeur = totalCompletedSales >= 50 || totalRevenue >= 5000;

        let rank = 0;
        if (totalCompletedSales > 0) {
            const allVendeurs = await Vendeur.find({});
            const vendeurStats = await Promise.all(
                allVendeurs.map(async (v) => {
                    const vOrders = await Order.find({
                        vendeurId: v._id,
                        status: { $in: ["COMPLETED", "DELIVERED"] },
                    });
                    return { vendeurId: v._id, count: vOrders.length };
                })
            );

            vendeurStats.sort((a, b) => b.count - a.count);

            const index = vendeurStats.findIndex(
                (v) => v.vendeurId.toString() === id
            );
            rank = index !== -1 ? index + 1 : 0;
        }

        return {
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
            // ✅ Recalculé à la volée, jamais lu depuis la base
            isOnline: computeIsOnline(openingTime, closingTime),
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
            },
        };
    },

    // ============================
    // UPDATE VENDEUR
    // ============================
    async updateVendeur(
        userId: string,
        data: { username?: string; avatar?: string; profileData?: any }
    ) {
        const user = await User.findById(userId);
        if (!user) return null;

        if (data.username !== undefined) user.username = data.username;
        if (data.avatar !== undefined) user.avatar = data.avatar;

        await user.save();

        let vendeurProfile = null;

        if (user.role === "vendeur" && data.profileData) {
            const allowedProfileData = {
                whatsappNumber: data.profileData.whatsappNumber,
                advantage: data.profileData.advantage,
                availability: data.profileData.availability,
                paymentAmount: data.profileData.paymentAmount,
                photoUrls: data.profileData.photoUrls,
                networks: data.profileData.networks,
                openingTime: data.profileData.openingTime,
                closingTime: data.profileData.closingTime,
            };

            vendeurProfile = await Vendeur.findByIdAndUpdate(
                user._id,
                { $set: allowedProfileData },
                { new: true }
            );
        }

        return {
            _id: user._id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile: vendeurProfile,
        };
    },

    // ============================
    // DELETE VENDEUR
    // ============================
    async deleteVendeur(userId: string) {
        const [user] = await Promise.all([
            User.findByIdAndDelete(userId),
            Vendeur.findByIdAndDelete(userId),
        ]);
        return user;
    },
};