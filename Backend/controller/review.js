import Product from "../models/product.js";
import Review from "../models/review.js";
import User from "../models/user.js";

// Add a review
export const addReview = async (req, res) => {
  try {
    const { review, rating } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: "unauthorized" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ 
      productId, 
      userName: user.name 
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: "You have already reviewed this product" 
      });
    }

    const newReview = await Review.create({
      productId,
      review,
      rating,
      userName: user.name,
    });

    await Product.findByIdAndUpdate(
      productId,
      { $push: { reviews: newReview._id } },
      { new: true }
    );

    res.status(201).json({ 
      message: "Review added successfully",
      review: newReview 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for a product
export const getReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      reviews,
      count: reviews.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
export const removeReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: "unauthorized" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review or is admin
    if (review.userName !== user.name && user.role !== "Admin") {
      return res.status(403).json({ 
        message: "You can only delete your own reviews" 
      });
    }

    // Remove review from product
    await Product.findByIdAndUpdate(
      review.productId,
      { $pull: { reviews: reviewId } },
      { new: true }
    );

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { review, rating } = req.body;
    const reviewId = req.params.id;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: "unauthorized" });
    }

    const existingReview = await Review.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review
    if (existingReview.userName !== user.name) {
      return res.status(403).json({ 
        message: "You can only update your own reviews" 
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { review, rating },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Review updated successfully",
      review: updatedReview 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};