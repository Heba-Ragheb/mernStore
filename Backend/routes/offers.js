import express from "express"
import { authJwt } from "../middleware/auth.js"
import { addOffer, deleteOffer, index, updateOffer } from "../controller/offer.js"
import upload from "../middleware/upload.js"

const router = express.Router()
router.post("/addOffer",authJwt,upload.single("image"),addOffer)
router.get("/",index)
router.delete("/deleteOffer/:id",authJwt,deleteOffer)
router.put("/updateOffer/:id",authJwt,updateOffer)
export default router