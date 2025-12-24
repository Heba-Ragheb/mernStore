import express from "express"
import upload from "../middleware/upload.js"
import { addProduct, addToCard, bestSeller, deleteProduct, getRecentlyViewed, index, relatedProduct, removeFromCard, showProduct, updateCartQuantity, updateProduct,smartRecommendations } from "../controller/product.js";
import { authJwt } from "../middleware/auth.js";
const router = express.Router();
router.post("/addOneImage",authJwt,upload.single("image"),addProduct)
router.post("/addmultiImage",authJwt,upload.array("image",5),addProduct)
router.get("/index",index)
router.get("/bestSeller",bestSeller)
router.post("/recently-viewed",getRecentlyViewed)
router.post("/smartRecommendations",smartRecommendations)
router.get("/show/:id",showProduct)
router.get("/relatedProducts/:id",relatedProduct)
router.delete("/delete/:id",authJwt,deleteProduct)
router.put("/update/:id",authJwt,updateProduct)
router.post("/addToCard/:id",authJwt,addToCard)
router.post("/removeFromCard/:id",authJwt,removeFromCard)
router.post("/updateCartQuantity/:id", authJwt, updateCartQuantity);
export default router