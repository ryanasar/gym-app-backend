import express from "express";
import { exchangeCodeForToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/token", exchangeCodeForToken);

export default router;
