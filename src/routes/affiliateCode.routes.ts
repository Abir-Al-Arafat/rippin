import express from "express";
const routes = express();
import {
  addAffiliateCode,
  getAllAffiliateCodes,
  getAffiliateCodeById,
  //   updateReelById,
  deleteAffiliateCodeById,
  //   approveConfession,
  //   cancelConfession,
} from "../controllers/affiliateCode.controller";

import {
  isAuthorizedUser,
  isAuthorizedAdmin,
} from "../middlewares/authValidationJWT";

routes.post(
  "/",
  // isAuthorizedUser,
  addAffiliateCode
);

routes.get("/", getAllAffiliateCodes);

routes.get("/:id", getAffiliateCodeById);
// // routes.get("/get-reel-by-user", isAuthorizedUser, getreelByUser);
// routes.put(
//   "/update-reel-by-id/:id",
//   //   isAuthorizedUser,
//   fileUpload(),
//   updateReelById
// );

routes.delete(
  "/:id",
  // isAuthorizedUser,
  deleteAffiliateCodeById
);

// routes.post("/approve-confession/:id", isAuthorizedAdmin, approveConfession);

// routes.post("/cancel-confession/:id", isAuthorizedAdmin, cancelConfession);

export default routes;
