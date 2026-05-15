import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";

const JWTSecret = process.env.JWT_SECRET!;

export const register: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.create({ email, password: hashedPassword });

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const login: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }


        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const access_token = jwt.sign({
        id: user._id
    }, JWTSecret,{
        expiresIn: "7d",
    });

        return res.status(200).json({ access_token });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};