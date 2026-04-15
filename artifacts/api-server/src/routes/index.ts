import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import roomsRouter from "./rooms";
import contractRouter from "./contract";
import paymentsRouter from "./payments";
import marketRouter from "./market";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(roomsRouter);
router.use(contractRouter);
router.use(paymentsRouter);
router.use(marketRouter);

export default router;
