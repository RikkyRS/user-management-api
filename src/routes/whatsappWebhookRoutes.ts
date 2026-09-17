import express from 'express';
import {
    verifyGet,
    receivePost
} from '../controllers/whatsappWebhookController.js';

const whatsappWebhookRouter = express.Router();

whatsappWebhookRouter.get('/', verifyGet);
whatsappWebhookRouter.post(
    '/',
    express.raw({ type: 'application/json', limit: '1mb' }),
    receivePost
);

export default whatsappWebhookRouter;
