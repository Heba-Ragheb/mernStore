import express from "express";
import passport from "passport";
import { generateToken } from "../controller/token.js";

const router = express.Router()
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        // Generate JWT token after successful Google auth
        const token = generateToken(req.user)
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        // Redirect to frontend
        res.redirect("http://localhost:3000/home")
    }
)
export default router;
