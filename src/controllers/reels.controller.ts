import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import HTTP_STATUS from "../constants/statusCodes";
import Reel from "../models/reel.model";
import { TUploadFields } from "../types/upload-fields";
import { failure, success } from "../utilities/common";

const addReel = async (req: Request, res: Response) => {
  try {
    console.log(req.body);

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

    if (files && files["ringtone"]) {
      let ringtoneFileName = "";
      if (files.ringtone[0]) {
        // Add public/uploads link to the image file

        ringtoneFileName = `public/uploads/audios/${files.ringtone[0].filename}`;
        newReel.url = ringtoneFileName;
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
    console.log(newReel, "NEW_REEL");

    return res
      .status(HTTP_STATUS.CREATED)
      .json(success("reel added successfully", newReel));
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
    const name = req.query.name;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    let query: any = { isDeleted: false }; // Ensure not to fetch deleted reels
    if (status) {
      query.status = status;
    }
    if (name) {
      if (typeof name === "string") {
        query.$or = [{ name: { $regex: new RegExp(name, "i") } }];
      }
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

    // Delete reel.url file if exists
    if (reel.url) {
      const filePath = path.join(
        rootPath,
        reel.url.replace(/^public[\\/]/, "public/")
      );
      console.log("filePath", filePath);
      console.log("fs.existsSync(filePath)", fs.existsSync(filePath));
      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath);
          console.log("Deleted file:", filePath);
        } catch (err) {
          console.log("Error deleting file:", filePath, err);
        }
      }
    }

    // Delete reel.localPath file if exists
    if (reel.localPath) {
      const localFilePath = path.join(
        rootPath,
        reel.localPath.replace(/^public[\\/]/, "public/")
      );
      if (fs.existsSync(localFilePath)) {
        try {
          await fs.promises.unlink(localFilePath);
          console.log("Deleted file:", localFilePath);
        } catch (err) {
          console.log("Error deleting file:", localFilePath, err);
        }
      }
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

const togglePopular = async (req: Request, res: Response) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(HTTP_STATUS.NOT_FOUND).send(failure("reel not found"));
    }
    reel.isPopular = !reel.isPopular;
    await reel.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully updated reel", reel));
  } catch (error: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error updating reel", error.message));
  }
};

export {
  addReel,
  deleteReelById,
  getAllReels,
  getReelById,
  updateReelById,
  togglePopular,
};
