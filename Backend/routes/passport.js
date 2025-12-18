// routes/googleAuth.js
import express from "express";
import passport from "passport";
import { generateToken } from "../controller/token.js";

const router = express.Router();

router.get("/google", passport.authenticate("google", { 
    scope: ["profile", "email"] 
}));

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        // Generate JWT token after successful Google auth
        const token = generateToken(req.user);
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only secure in production
            sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        
        // Redirect to frontend using environment variable
        const frontendURL = process.env.CLIENT_URL || "http://localhost:3000";
        res.redirect(`${frontendURL}/`);
    }
);

export default router;
