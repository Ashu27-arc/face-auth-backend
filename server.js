import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();
connectDB();
const ensureAdmin = async () => {
    const adminExists = await User.findOne({
        email: "admin@admin.com"
    });
    if (!adminExists) {
        await User.create({
            name: "Admin",
            email: "admin@admin.com",
            password: await bcrypt.hash("admin123", 10),
            role: "admin",
        });
        console.log("Admin created: admin@admin.com / admin123");
    }
};
ensureAdmin();

const app = express();
app.use(cors());
app.use(express.json({
    limit: '50mb'
}));
app.use(express.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () =>
    console.log("Backend running on port", process.env.PORT)
);