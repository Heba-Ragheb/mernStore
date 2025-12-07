import User from "../models/user.js";
import Offer from "../models/offer.js";
export const addOffer = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user || user.role == "User") {
      return res.status(401).json({ message: "unauthorized" });
    }
    const images = [];

    // Single image upload
    if (req.file) {
      images.push({
        public_id: req.file.filename,
        url: req.file.path,
      });
    }

    // Multiple images upload
   const offer = await Offer.create({
     
      images,
      
    });

    res.status(201).json({ offer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
export const index = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.status(200).json({ offers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
export const deleteOffer = async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user || user.role == "User") {
      return res.status(401).json({ message: "unauthorized" });
    }
    const offer = await Offer.findById(offerId);
    if (!offer)
      return res.status(404).json({ message: "Product not found" });

    await Offer.findByIdAndDelete(offerId);

    res.status(200).json({ message: "offer deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- Update Product ----------------------
export const updateOffer = async (req, res) => {
  try {
    const offerId = req.params.id;

    const offer = await Offer.findById(offerId);
    if (!offer)
      return res.status(404).json({ message: "offer not found" });

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      req.body,
      { new: true }
    );

    res.status(200).json({ message: "offer updated", updatedOffer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};