import express from "express";
const routes = express();
import fileUpload from "../middlewares/fileUpload";
import {
  addReel,
  getAllReels,
  getReelById,
  updateReelById,
  deleteReelById,
  togglePopular,
} from "../controllers/reels.controller";

import {
  isAuthorizedUser,
  isAuthorizedAdmin,
} from "../middlewares/authValidationJWT";

routes.post(
  "/add-reel",
  // isAuthorizedUser,
  fileUpload(),
  addReel
);

routes.get("/get-all-reels", getAllReels);

routes.get("/get-reel-by-id/:id", getReelById);
// routes.get("/get-reel-by-user", isAuthorizedUser, getreelByUser);
routes.put(
  "/update-reel-by-id/:id",
  //   isAuthorizedUser,
  fileUpload(),
  updateReelById
);

routes.delete(
  "/delete-reel-by-id/:id",
  // isAuthorizedUser,
  deleteReelById
);

routes.post(
  "/toggle-popular/:id",
  // isAuthorizedUser,
  togglePopular
);

export default routes;
