import express from "express";
import {
  addCategory,
  getCategories,
  show,
  addSubcategory,
  editCategory,
  editSubcategory,
  deleteCategory,
  deleteSubcategory,
  getSubCategoryProduct,
  getSubCategory,
} from "../controller/category.js";
import { authJwt } from "../middleware/auth.js";

const router = express.Router();

// Category routes
router.post("/", authJwt, addCategory);          // Add category
router.get("/", getCategories);                  // Get all categories
router.get("/:id", show);                        // Show products in category
router.put("/:id", authJwt, editCategory);       // Edit category
router.delete("/:id", authJwt, deleteCategory);  // Delete category
router.get("/:categoryId/sub/:subId", getSubCategoryProduct); 
router.get("/sub/:categoryId/", getSubCategory);  
// Subcategory routes
router.post("/:categoryId/sub", authJwt, addSubcategory);
router.put("/:categoryId/sub/:subId", authJwt, editSubcategory);
router.delete("/:categoryId/sub/:subId", authJwt, deleteSubcategory);

export default router;
