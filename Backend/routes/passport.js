// routes/googleAuth.js
import express from "express";
import passport from "passport";
import { generateToken } from "../controller/token.js";

const router = express.Router();

router.get("/google", passport.authenticate("google", { 
    scope: ["profile", "email"] ,
    session: false 
}));

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        console.log('Google callback hit!');
        console.log('User from passport:', req.user);
        
        // Generate JWT token after successful Google auth
        const token = generateToken(req.user);
        console.log('Generated token:', token);
        
        // Set cookie just like regular login
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        
        console.log('Cookie set, redirecting to frontend');
        
        // Redirect to callback page (not home page!)
        const frontendURL = process.env.CLIENT_URL || "http://localhost:3000";
        const redirectURL = `${frontendURL}/auth/google/callback`;
        console.log('Redirecting to:', redirectURL);
        
        res.redirect(redirectURL);
    }
);

export default router;