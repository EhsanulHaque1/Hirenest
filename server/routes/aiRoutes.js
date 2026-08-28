import express from "express";
const router = express.Router();
import { getChatResponse } from "../controllers/aiController.js";

router.post("/chat", getChatResponse);

export default router;
