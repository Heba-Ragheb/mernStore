import express from "express"
import upload from "../middleware/upload.js"
import { addProduct, deleteProduct, index, showProduct } from "../controller/product.js";
import { authJwt } from "../middleware/auth.js";
const router = express.Router();
router.post("/addOneImage",authJwt,upload.single("image"),addProduct)
router.post("/addmultiImage",upload.array("image",5),addProduct)
router.get("/index",index)
router.get("/show/:id",showProduct)
router.delete("/delete/:id",deleteProduct)
export default router