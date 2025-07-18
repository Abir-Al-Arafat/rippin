import { Router } from "express";
import {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQById,
  deleteFAQById,
} from "../controllers/faq.controller";

const router = Router();

// /api/faqs
router.post("/", createFAQ);

// /api/faqs
router.get("/", getAllFAQs);

// /api/faqs/:id
router.get("/:id", getFAQById);

// /api/faqs/:id
router.put("/:id", updateFAQById);

// /api/faqs/:id
router.delete("/:id", deleteFAQById);

export default router;
