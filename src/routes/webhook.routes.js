import express from "express";
import {   verifyWebhook,  webhookHandler } from "../controllers/webhook.controller.js";

const router = express.Router();

router.get("/", verifyWebhook);
//router.post("/", receiveMessage);
router.post("/", webhookHandler);


export default router;