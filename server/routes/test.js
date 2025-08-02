import express from 'express';
import {TestController} from "../controllers/testController.js";
import auth from "../middleware/auth.js";

const router =  express.Router();

router.get('/', TestController)

export default router;