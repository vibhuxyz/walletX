import { asyncHandler, authMiddleware } from "@repo/http";
import { Router } from "express";
import * as deviceController from "../controller/device.controller.js"

const router: Router = Router();

router.get(
  "/devices",
  authMiddleware,
  asyncHandler(deviceController.getDevices),
);

router.post(
  "/devices/:deviceId/trust",
  authMiddleware,
  asyncHandler(deviceController.trustDevice),
);





export default router;
