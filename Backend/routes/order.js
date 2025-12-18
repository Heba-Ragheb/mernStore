import express from "express";
import { addOrder, getAllOrder, getOrder, removeOrder, updateOrder,updateOrderStatus, } from "../controller/order.js";
import { authJwt } from "../middleware/auth.js";
const router = express.Router()
router.post("/addOrder",authJwt,addOrder)
router.delete("/delete/:id",authJwt,removeOrder)
router.get("/show/:id",authJwt,getOrder)
router.get("/",authJwt,getAllOrder)
router.put("/update/:id",authJwt,updateOrder)
// In your order routes file
//router.get('/orders', authJwt, userOrders);
router.put("/updateStatus/:id",authJwt,updateOrderStatus)
export default router