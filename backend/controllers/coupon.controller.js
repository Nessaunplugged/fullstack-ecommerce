import Coupon from "../models/coupon.model.js";
export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
    res.json(coupon || null);
  } catch (error) {
    console.log("Error in getCoupon controller", error.message);
    res.status(500).json({ error: " Server Error", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    if (coupon.expiryDate < new Date()) {
      coupon.isActive = false;
      return res.status(400).json({ error: "Coupon has expired" });
    }
    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discount: coupon.discount,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller", error.message);
    res.status(500).json({ error: " Server Error", error: error.message });
  }
};
