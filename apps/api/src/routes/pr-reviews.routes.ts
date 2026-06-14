import { Router } from "express";
import { getPRReviews, getPRReviewById } from "../controllers/pr-review.controller";

const router: Router = Router();

router.get("/", getPRReviews);
router.get("/:id", getPRReviewById);

export default router;
