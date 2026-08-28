import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  submitComplaint,
  getComplaints,
} from "../controllers/complaintController.js";

const router = express.Router();

router.post("/submit", verifyToken, submitComplaint);
router.get("/", getComplaints);

export default router;
