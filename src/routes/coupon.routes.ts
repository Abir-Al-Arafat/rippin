import { Router } from "express";
import {
  addCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  getCouponByCode,
} from "../controllers/coupon.controller";

const router = Router();

// Add a new coupon
router.post("/", addCoupon);

// Delete a coupon by ID
router.delete("/:id", deleteCoupon);

// Get all coupons
router.get("/", getAllCoupons);

// Get coupon by ID
router.get("/id/:id", getCouponById);

// Get coupon by code
router.get("/code/:code", getCouponByCode);

export default router;
