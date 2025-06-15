import fs from "fs";
import { Request, Response } from "express";
import { success, failure } from "../utilities/common";
import HTTP_STATUS from "../constants/statusCodes";
import Reel from "../models/reel.model";
import User from "../models/user.model";
import Nootification from "../models/notification.model";
import { emailWithNodemailerGmail } from "../config/email.config";
import { UserRequest } from "../interfaces/user.interface";
import { TUploadFields } from "../types/upload-fields";

const addReel = async (req: Request, res: Response) => {
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

    let { title, artist, artwork, playlists, reelType, name, colorCode } =
      req.body;

    console.log("typeof playlists", typeof playlists);
    console.log("typeof reelType", typeof reelType);

    if (typeof playlists === "string") {
      playlists = JSON.parse(playlists);
    }

    if (typeof reelType === "string") {
      reelType = JSON.parse(reelType);
    }

    const newReel = new Reel({
      title,
      artist,
      artwork,
      playlists,
      reelType,
      name,
      colorCode,
    });

    if (!newReel) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("reel could not be added"));
    }

    const files = req.files as TUploadFields;

    console.log("req.files", files);
    console.log("req.filesaudioFile", files["audioFile"]);

    if (files && files["audioFile"]) {
      let audioFileName = "";
      if (files.audioFile[0]) {
        // Add public/uploads link to the image file

        audioFileName = `public/uploads/audios/${files.audioFile[0].filename}`;
        newReel.url = audioFileName;
      }
    }

    if (files && files["ringtone"]) {
      let ringtoneFileName = "";
      if (files.ringtone[0]) {
        // Add public/uploads link to the image file

        ringtoneFileName = `public/uploads/audios/${files.ringtone[0].filename}`;
        newReel.ringtone = ringtoneFileName;
      }
    }

    if (files && files["banner"]) {
      let bannerFileName = "";
      if (files.banner[0]) {
        bannerFileName = `public/uploads/images/${files.banner[0].filename}`;
        newReel.banner = bannerFileName;
      }
    }

    await newReel.save();
    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("reel added successfully", newReel));
  } catch (err: any) {
    console.log("error adding reel", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("error adding reel", err.message));
  }
};

const updateReelById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide reel id"));
    }
    const reel = await Reel.findById(req.params.id);
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

    const files = req.files as TUploadFields;

    if (req.files && files["audioFile"]) {
      let audioFileName = "";
      if (files.audioFile[0]) {
        const audioFilePath = `src/public/uploads/audios/${files.audioFile[0].filename}`;
        if (reel.url) {
          const filePath = reel.url.split("/").pop();
          const oldFilePath = `src/public/uploads/audios/${filePath}`;
          try {
            await fs.promises.unlink(oldFilePath);
          } catch (error) {
            console.log("error deleting old file", error);
          }
        }
        audioFileName = audioFilePath;
        reel.url = audioFilePath;
      }
    }

    await reel.save();

    const updatedReel = await Reel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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

const getAllReels = async (req: Request, res: Response) => {
  try {
    let page =
      typeof req.query.page === "string" ? parseInt(req.query.page) || 1 : 1;
    let limit =
      typeof req.query.limit === "string"
        ? parseInt(req.query.limit ?? "10")
        : 10;
    const status = req.query.status;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    let query: any = {};
    if (status) {
      query.status = status;
    }

    const reels = await Reel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const count = await Reel.countDocuments(query);

    if (!reels) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("reels not found"));
    }
    return res.status(HTTP_STATUS.OK).send(
      success("Successfully received all reels", {
        result: reels,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      })
    );
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching reels", error.message));
  }
};

const getReelById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide podcast id"));
    }
    const podcast = await Reel.findById(req.params.id);
    if (!podcast) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("podcast not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully received podcast", podcast));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching podcast", error.message));
  }
};

const deleteReelById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide reel id"));
    }
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (!reel) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("reel not found"));
    }

    const rootPath = process.cwd();
    if (reel.url && fs.existsSync(`${rootPath}/${reel.url}`)) {
      await fs.promises.unlink(`${rootPath}/${reel.url}`);
    }
    if (reel.localPath && fs.existsSync(`${rootPath}/${reel.localPath}`)) {
      await fs.promises.unlink(`${rootPath}/${reel.localPath}`);
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully deleted reel", reel));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error deleting reel", error.message));
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
  addReel,
  getAllReels,
  getReelById,
  updateReelById,
  deleteReelById,
  //   getConfessionByUser,
  //   approveConfession,
  //   cancelConfession,
};
