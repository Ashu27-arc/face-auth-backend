import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(" ")[1] : null;

        if (!token) return res.status(401).json({
            message: "Unauthorized"
        });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;

        next();
    } catch (err) {
        res.status(401).json({
            message: "Token Invalid"
        });
    }
};