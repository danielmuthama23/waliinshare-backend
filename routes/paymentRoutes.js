import express from 'express';
import { createStripeSession, createPaypalOrder } from '../controllers/paymentController.js';

const router = express.Router();

// Stripe Checkout Session Route
router.post('/stripe-session', createStripeSession);
router.post('/paypal', createPaypalOrder); // ✅ Add this


export default router;