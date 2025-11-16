import User from "../models/user.js"
import bcrypt from "bcrypt"
import { generateToken,verifyToken } from "./token.js"
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await User.findOne({email})
        if(existing){
            res.status(400).json({ message: "User with this email already exists" });
       } else{
        const newPassword = await bcrypt.hash(password, 10)
     
        const user = new User({ name, email,password:newPassword, role })
        const newUser = await user.save()
         const token = generateToken(user)
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",

            maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        res.status(200).json({ message: "user added", user: newUser })}
    } catch (error) {
        res.status(400).send({
            message: "An error occurred while registeration",
            error: error.message,
        });
    }

}
export const login = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        if (!email) {
            res.status(404).json({ message: "user nor found" })
        }
        const user = await User.findOne({email})
        const passwordCheck = await bcrypt.compare(password, user.password)
        if (!passwordCheck) {
            res.status(500).json({ message: "password or email is not correct" })
        }
        const token = generateToken(user)
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",

            maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        res.status(200).json({ message: "user login", user: user })
    } catch (error) {
        res.status(400).send({
            message: "An error occurred while logging",
            error: error.message,
        });
    }


}
export const getCurrentUser = async (req,res)=>{
   try {
     const token = req.cookies.token
     
     if(!token){
           return res.status(401).json({ message: "Not authenticated" });
       
     }
     const decoded = verifyToken(token)
    
     const user = await User.findById(decoded._id).select('-password')
     
      if (!user) {
             return res.status(404).json({ message: "User not found" });
         }
     

         res.status(200).json({ user });
 
   } catch (error) {
     res.status(401).json({
            message: "Invalid or expired token",
            error: error.message,
        });
   }
}
export const logout = async(req,res)=>{
    try {
        res.clearCookie("token")
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
         res.status(401).json({
            message: "Invalid or expired token",
            error: error.message,
        });
    }
}