import { authMiddleware } from "@repo/http";
import { Router } from "express";
import { getWebSocketToken } from "../controllers/auth.controller.js";


const router: Router = Router();

router.get("/ws-token", authMiddleware, getWebSocketToken);

export default router;
