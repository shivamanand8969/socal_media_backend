import express from 'express'
import isAuthencated from '../middlewares/isAuthancated.js'
import { getMessage, sendMessagge } from '../controller/message.controller.js';

const router=express.Router();
router.route('/send/:id').post(isAuthencated,sendMessagge)
router.route('/all/:id').get(isAuthencated,getMessage);

export default router;
