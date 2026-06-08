import userModel from '../models/userModel.js';

export const getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isAccountVerified: user.isAccountVerified,
                isBlocked: user.isBlocked,
                status: user.isBlocked ? 'Blocked' : 'Active',
                joinedAt: user.createdAt,
                canBlock: user.role !== 'admin',
            },
        });
    } catch (error) {
        console.error("GET USER BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password');

        const result = users.map((user) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isAccountVerified: user.isAccountVerified,
            isBlocked: user.isBlocked,
            status: user.isBlocked ? 'Blocked' : 'Active',
            joinedAt: user.createdAt,
            canBlock: user.role !== 'admin',
        }));

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users: result,
        });
    } catch (error) {
        console.error("GET ALL USERS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ success: false, message: "Role must be 'admin' or 'user'" });
    }

    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user._id.toString() === req.userId) {
            return res.status(403).json({ success: false, message: "Cannot change your own role" });
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User role updated to '${role}' successfully`,
            role: user.role,
        });
    } catch (error) {
        console.error("UPDATE USER ROLE ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleBlockUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: "Cannot block an admin" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        return res.status(200).json({
            success: true,
            message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
            isBlocked: user.isBlocked,
        });
    } catch (error) {
        console.error("TOGGLE BLOCK USER ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUserById = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("DELETE USER ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
