import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
} from "../controllers/users.controller";

const router = Router();

// /api/users

router.get("/", getUsers);

// /api/users/123
router.get("/:id", getUserById);

// /api/users

router.post("/", createUser);

export default router;
