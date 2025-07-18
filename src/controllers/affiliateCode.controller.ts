import fs from "fs";
import { Request, Response } from "express";
import { success, failure, generateRandomCode } from "../utilities/common";
import HTTP_STATUS from "../constants/statusCodes";
import AffiliateCode from "../models/affiliateCode.model";
import User from "../models/user.model";
import Nootification from "../models/notification.model";
import { emailWithNodemailerGmail } from "../config/email.config";
import { UserRequest } from "../interfaces/user.interface";
import { TUploadFields } from "../types/upload-fields";

const addAffiliateCode = async (req: Request, res: Response) => {
  try {
    // if (!(req as UserRequest).user || !(req as UserRequest).user._id) {
    //   return res
    //     .status(HTTP_STATUS.NOT_FOUND)
    //     .send(failure("User not logged in"));
    // }

    // const user = await User.findById((req as UserRequest).user._id);
    // if (!user) {
    //   return res.status(HTTP_STATUS.NOT_FOUND).send(failure("User not found"));
    // }
    let code = generateRandomCode(4);
    let existingAffiliateCode = await AffiliateCode.findOne({ code });
    console.log("existingAffiliateCode", existingAffiliateCode);
    while (existingAffiliateCode) {
      code = generateRandomCode(4);
      existingAffiliateCode = await AffiliateCode.findOne({ code });
    }
    const newAffiliateCode = new AffiliateCode({ code });

    if (!newAffiliateCode) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("reel could not be added"));
    }

    await newAffiliateCode.save();
    return res
      .status(HTTP_STATUS.CREATED)
      .send(
        success("reel affiliate code added successfully", newAffiliateCode)
      );
  } catch (err: any) {
    console.log("error adding reel", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("error adding reel", err.message));
  }
};

const updateAffiliateCodeById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide reel id"));
    }
    const reel = await AffiliateCode.findById(req.params.id);
    if (!reel) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("reel not found"));
    }

    let { playlists, reelType } = req.body;
    if (playlists && typeof playlists === "string") {
      playlists = JSON.parse(playlists);
    }
    req.body.playlists = playlists;

    if (reelType && typeof reelType === "string") {
      reelType = JSON.parse(reelType);
    }
    req.body.reelType = reelType;

    await reel.save();

    const updatedReel = await AffiliateCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedReel) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("reel not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully updated reel", updatedReel));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const getAllAffiliateCodes = async (req: Request, res: Response) => {
  try {
    const affiliateCodes = await AffiliateCode.find().select(
      "-__v -expiresAt -usageCount -maxUsage -reward -rewardType -isActive"
    );

    if (!affiliateCodes) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("affiliate codes not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(
        success("Successfully received all affiliate codes", affiliateCodes)
      );
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching affiliate codes", error.message));
  }
};

const getAffiliateCodeById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide affiliateCode id"));
    }
    const affiliateCode = await AffiliateCode.findById(req.params.id).select(
      "-__v -expiresAt -usageCount -maxUsage -reward -rewardType -isActive"
    );
    if (!affiliateCode) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("affiliateCode not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully received affiliateCode", affiliateCode));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching affiliateCode", error.message));
  }
};

const deleteAffiliateCodeById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide affiliateCode id"));
    }
    const affiliateCode = await AffiliateCode.findByIdAndDelete(req.params.id);

    if (!affiliateCode) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("affiliateCode not found"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully deleted affiliateCode", affiliateCode));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error deleting affiliateCode", error.message));
  }
};

// const getConfessionByUser = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(HTTP_STATUS.NOT_FOUND).send(failure("please log in"));
//     }
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(HTTP_STATUS.NOT_FOUND).send(failure("user not found"));
//     }
//     const confessions = await Reel.find({ user: req.user._id });
//     if (!confessions) {
//       return res
//         .status(HTTP_STATUS.NOT_FOUND)
//         .send(failure("confessions not found"));
//     }
//     return res
//       .status(HTTP_STATUS.OK)
//       .send(success("Successfully received confessions", confessions));
//   } catch (error) {
//     return res
//       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
//       .send(failure("Error fetching confessions", error.message));
//   }
// };

// const approveConfession = async (req, res) => {
//   try {
//     if (!req.params.id) {
//       return res
//         .status(HTTP_STATUS.NOT_FOUND)
//         .send(failure("Please provide confession id"));
//     }
//     const confession = await Reel.findById(req.params.id);
//     if (!confession) {
//       return res
//         .status(HTTP_STATUS.NOT_FOUND)
//         .send(failure("confession not found"));
//     }

//     confession.status = "approved";
//     await confession.save();

//     const user = await User.findById(confession.user);
//     if (!user) {
//       return res.status(HTTP_STATUS.NOT_FOUND).send(failure("User not found"));
//     }

//     const notification = new Nootification({
//       uploader: user._id,
//       admin: req.user._id,
//       confession: confession._id,
//       status: "approved",
//       message: `Your confession "${confession.title}" has been approved`,
//       type: "confession",
//     });
//     await notification.save();

//     const emailData = {
//       email: user.email,
//       subject: "Confession approved",
//       html: `
//         <div style="max-width: 500px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: center; font-family: Arial, sans-serif;">
//           <h6 style="font-size: 16px; color: #333;">Hello, ${
//             user.name || "User"
//           }</h6>
//           <p style="font-size: 14px; color: #555;">Your confession "${
//             confession.title
//           }" has been approved.</p>
//           <p style="font-size: 14px; color: #555;">Thank you for sharing your confession.</p>
//         </div>
//       `,
//     };
//     await emailWithNodemailerGmail(emailData);

//     return res
//       .status(HTTP_STATUS.OK)
//       .send(success("Successfully approved confession", confession));
//   } catch (error) {
//     return res
//       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
//       .send(failure("Error approving confession", error.message));
//   }
// };

// const cancelConfession = async (req, res) => {
//   try {
//     if (!req.params.id) {
//       return res
//         .status(HTTP_STATUS.NOT_FOUND)
//         .send(failure("Please provide confession id"));
//     }
//     const confession = await Reel.findById(req.params.id);
//     if (!confession) {
//       return res
//         .status(HTTP_STATUS.NOT_FOUND)
//         .send(failure("confession not found"));
//     }

//     confession.status = "cancelled";
//     await confession.save();

//     const user = await User.findById(confession.user);
//     if (!user) {
//       return res.status(HTTP_STATUS.NOT_FOUND).send(failure("User not found"));
//     }

//     const notification = new Nootification({
//       uploader: user._id,
//       admin: req.user._id,
//       confession: confession._id,
//       status: "cancelled",
//       message: `Your confession "${confession.title}" has been cancelled`,
//       type: "confession",
//     });
//     await notification.save();

//     const emailData = {
//       email: user.email,
//       subject: "Confession cancelled",
//       html: `
//         <div style="max-width: 500px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: center; font-family: Arial, sans-serif;">
//           <h6 style="font-size: 16px; color: #333;">Hello, ${
//             user.name || "User"
//           }</h6>
//           <p style="font-size: 14px; color: #555;">Your confession "${
//             confession.title
//           }" has been cancelled.</p>
//           <p style="font-size: 14px; color: #555;">Thank you for sharing your confession.</p>
//         </div>
//       `,
//     };
//     await emailWithNodemailerGmail(emailData);

//     return res
//       .status(HTTP_STATUS.OK)
//       .send(success("Successfully rejected confession", confession));
//   } catch (error) {
//     return res
//       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
//       .send(failure("Error rejecting confession", error.message));
//   }
// };

export {
  addAffiliateCode,
  getAllAffiliateCodes,
  getAffiliateCodeById,
  updateAffiliateCodeById,
  deleteAffiliateCodeById,
  //   getConfessionByUser,
  //   approveConfession,
  //   cancelConfession,
};
