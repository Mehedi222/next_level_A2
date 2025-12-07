import express from "express";
import { userControllers } from "./user.controller";
const router = express.Router();

router.post("/", userControllers.createUser);
router.get("/", userControllers.getAllUsers);
router.get("/:id", userControllers.getSingleUser);
router.put("/:id", userControllers.updateUser);
router.delete("/:id", userControllers.deleteUser);

export const userRoutes = router;
