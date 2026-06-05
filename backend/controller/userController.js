import userModel from '../models/userModel.js';

export const updateUser = async (req, res) => {
    const userId = req.userId;
    const { name, avatar } = req.body;

    if (!name && !avatar) {
        return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    try {
        const updates = {};
        if (name) updates.name = name;
        if (avatar) updates.avatar = avatar;

        const user = await userModel.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getUser = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            user
        });
    } catch (error) {
        console.error("GET USER ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}