import express from "express";
import { addReview, getReviews, removeReview, updateReview } from "../controller/review.js";
import { authJwt} from "../middleware/auth.js";

const router = express.Router();

// Get all reviews for a product (public)
router.get("/:id", getReviews);

// Add a review (requires authentication)
router.post("/:id", authJwt, addReview);

// Update a review (requires authentication)
router.put("/:id", authJwt, updateReview);

// Delete a review (requires authentication)
router.delete("/:id", authJwt, removeReview);

export default router;