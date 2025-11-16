import express from "express"
import { addCategory, index } from "../controller/category.js"
import { authJwt } from "../middleware/auth.js"
import upload from "../middleware/upload.js"
const router = express.Router()
router.post("/add",authJwt,upload.single("image"),addCategory)
router.get("/",index)
export default router