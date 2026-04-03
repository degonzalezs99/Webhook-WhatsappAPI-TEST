import express from "express";
import {   verifyWebhook,  receiveMessage, webhookHandler } from "../controllers/webhook.controller.js";

const router = express.Router();

router.get("/", verifyWebhook);
router.post("/", receiveMessage);
router.post("/webhook", webhookHandler);


export default router;