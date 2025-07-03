import { Request, Response } from "express";
import Coupon from "../models/coupon.model";
import HTTP_STATUS from "../constants/statusCodes";
import { success, failure, generateRandomCode } from "../utilities/common";

// Add a new coupon
const addCoupon = async (req: Request, res: Response) => {
  try {
    let code = generateRandomCode(4);
    let existingCoupon = await Coupon.findOne({ code });
    console.log("existingCoupon", existingCoupon);
    while (existingCoupon) {
      code = generateRandomCode(4);
      existingCoupon = await Coupon.findOne({ code });
    }

    const newCoupon = await Coupon.create({
      code,
    });

    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Coupon created successfully", newCoupon));
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error creating coupon", err.message));
  }
};

// Delete a coupon by ID
const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Coupon id is required"));
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Coupon not found"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Coupon deleted successfully", coupon));
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error deleting coupon", err.message));
  }
};

const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({});
    if (!coupons.length) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("No coupons found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully received coupons", coupons));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching coupons", error.message));
  }
};

const getCouponById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Coupon id is required"));
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Coupon not found"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully received coupon", coupon));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching coupon", error.message));
  }
};

const getCouponByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Coupon code is required"));
    }

    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Coupon not found"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully received coupon", coupon));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching coupon", error.message));
  }
};

export {
  addCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  getCouponByCode,
};
