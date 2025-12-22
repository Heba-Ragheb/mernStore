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
export const getSubCategoryProduc = async (req, res) => {
  try {
    const { categoryId, subId } = req.params;

    // PROBLEM 1 FIX: Subcategories are embedded documents, not references
    // They can't be populated like regular references
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // PROBLEM 2 FIX: Use .id() method to find embedded subdocument
    // Not .populate() because subcategories are embedded in the schema
    const subcategory = category.subcategories.id(subId);

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    // PROBLEM 3 FIX: Get products by querying Product model directly
    // The subcategory.products array only stores IDs, we need to populate them
    const products = await Product.find({ 
      category: categoryId,
      subCategory: subId 
    });

    // PROBLEM 4 FIX: Return proper response structure
    // Instead of category.subcategories[1].products (wrong index!)
    res.status(200).json({
      category: {
        _id: category._id,
        name: category.name
      },
      subcategory: {
        _id: subcategory._id,
        name: subcategory.name
      },
      products: products
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getSubCategoryProduct = async (req, res) => {
  try {
    const { categoryId, subId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

     const subcategory = category.subcategories.id(subId);
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

     const products = await Product.find({ 
      category: categoryId,
      subCategory: subId 
    });

      res.status(200).json({ products });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
export const getSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    // Safety check
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      categoryId: category._id,
      categoryName: category.name,
      subcategories: category.subcategories
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

