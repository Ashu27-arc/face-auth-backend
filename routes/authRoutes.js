import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile
} from "../controllers/authController.js";
import {
    protect
} from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import {
    adminOnly
} from "../middleware/adminMiddleware.js";
import User from "../models/User.js";
import LoginLog from "../models/LoginLog.js";
import bcrypt from "bcryptjs";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

// Update user profile
router.post("/update", protect, async (req, res) => {
    const {
        field,
        value
    } = req.body;
    const user = await User.findById(req.user);

    if (!user) return res.status(404).json({
        message: "User not found"
    });

    if (field === "password") {
        user.password = await bcrypt.hash(value, 10);
    } else if (field === "name" || field === "email") {
        user[field] = value;
    }

    await user.save();
    res.json({
        message: "Updated successfully"
    });
});
router.get("/refresh", protect, async (req, res) => {
    const token = jwt.sign({
        id: req.user
    }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.json({
        token
    });
});


router.get("/admin/logs", protect, adminOnly, async (req, res) => {
    const logs = await LoginLog.find().populate("userId", "name email");
    res.json(logs);
});


router.get("/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post("/face-login", async (req, res) => {
    const {
        userId
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({
        message: "User not found"
    });

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.json({
        token
    });
    await LoginLog.create({
        userId,
        method: "face",
    });

});

// Get all users (Admin only)
router.get("/admin/users", protect, adminOnly, async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
});

// Delete user (Admin only)
router.delete("/admin/delete/:id", protect, adminOnly, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({
        message: "User deleted"
    });
});

// Create user or update face (Admin)
router.post("/admin/create", protect, adminOnly, async (req, res) => {
    const {
        name,
        email,
        password,
        faceEmbedding,
        role,
        updateFaceOnly,
        userId
    } = req.body;

    // If updating face only
    if (updateFaceOnly && userId) {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({
            message: "User not found"
        });

        user.faceEmbedding = faceEmbedding;
        await user.save();

        return res.json({
            message: "Face updated",
            user
        });
    }

    // Create new user
    const exists = await User.findOne({
        email
    });
    if (exists) return res.status(400).json({
        message: "User exists"
    });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashed,
        faceEmbedding,
        role: role || "user",
    });

    res.json({
        message: "User created",
        user
    });
});



export default router;