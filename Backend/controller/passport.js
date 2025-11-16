import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "../models/user.js"
import dotenv from "dotenv"
dotenv.config()

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5050/api/googleAuth/google/callback",
    },
        async (accessToken,refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id })
                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: "google-oauth-no-password",
                        role: "User",
                    })}
                    done(null, user)
                
            } catch (error) {
                done(error, null);
            }

        })
)
export default passport
