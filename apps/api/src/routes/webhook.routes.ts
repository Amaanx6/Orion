import { Router } from "express";
import { handleGithubWebhook } from "../controllers/webhook.controller";

const router:Router = Router();

router.post("/", handleGithubWebhook);

export default router;