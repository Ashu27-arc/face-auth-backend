import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import LoginLog from "../models/LoginLog.js";


const generateToken = (id) => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Register Face
export const registerUser = async (req, res) => {
    const {
        name,
        email,
        password,
        faceEmbedding
    } = req.body;

    const exists = await User.findOne({
        email
    });
    if (exists) return res.status(400).json({
        message: "User already exists"
    });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashed,
        faceEmbedding,
    });

    res.json({
        message: "User registered successfully",
        user
    });
};

// Login Face
export const loginUser = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    const user = await User.findOne({
        email
    });
    if (!user) return res.status(400).json({
        message: "User does not exist"
    });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({
        message: "Invalid credentials"
    });

    await LoginLog.create({
        userId: user._id,
        method: "password",
    });

    res.json({
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
    });
};

// Get User Details
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user);
    res.json(user);
};