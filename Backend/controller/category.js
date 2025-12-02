import User from "../models/user.js";
import Category from "../models/category.js";
import Product from "../models/product.js";

// -----------------------------
// ADD NEW CATEGORY
// -----------------------------
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.role === "User") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const category = await Category.create({ name });

    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------
// GET ALL CATEGORIES
// -----------------------------
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------
// GET PRODUCTS IN A CATEGORY
// -----------------------------
export const show = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const products = await Product.find({ category: categoryId });

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------
// ADD SUBCATEGORY
// -----------------------------
export const addSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.role === "User") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const category = await Category.findById(categoryId);

    category.subcategories.push({ name });
    await category.save();

    res.json({ message: "Subcategory added", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------
// EDIT CATEGORY
// -----------------------------
export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updated = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    res.json({ message: "Category updated", category: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------
// EDIT SUBCATEGORY
// -----------------------------
export const editSubcategory = async (req, res) => {
  try {
    const { categoryId, subId } = req.params;
    const { name } = req.body;

    const category = await Category.findById(categoryId);
    const sub = category.subcategories.id(subId);

    sub.name = name;
    await category.save();

    res.json({ message: "Subcategory updated", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------
// DELETE CATEGORY
// -----------------------------
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await Category.findByIdAndDelete(id);

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------
// DELETE SUBCATEGORY
// -----------------------------
export const deleteSubcategory = async (req, res) => {
  try {
    const { categoryId, subId } = req.params;

    const category = await Category.findById(categoryId);
    category.subcategories = category.subcategories.filter(
      (s) => s._id.toString() !== subId
    );

    await category.save();

    res.json({ message: "Subcategory deleted", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
