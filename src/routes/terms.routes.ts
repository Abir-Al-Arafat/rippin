import { Router } from "express";
import {
  createTerms,
  getAllTerms,
  getTermsById,
  //   updateTermsById,
  deleteTermsById,
  deleteAllTerms,
} from "../controllers/terms.controller";

const router = Router();

router.post("/", createTerms);
router.get("/", getAllTerms);
router.get("/:id", getTermsById);
// router.put("/:id", updateTermsById);
// router.delete("/:id", deleteTermsById);
router.delete("/", deleteAllTerms);

export default router;
