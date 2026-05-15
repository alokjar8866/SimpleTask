import type { NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";

export const protect: RequestHandler = async (req, res, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET is not defined");

        const decoded = jwt.verify(token, secret);

        const user = await UserModel.findById((decoded as any).id);
        if (!user) {
            return res.status(401).json({ message: "User no longer exists." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
};