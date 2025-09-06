import dotenv from 'dotenv';
dotenv.config(); // Ensure this is called before using environment variables

import Stripe from 'stripe';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// ✅ Stripe Payment Integration
export const createStripeSession = async (req, res) => {
  try {
    const { shares, phone, currency } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `${shares} Share(s) of Waliin Investment`,
          },
          unit_amount: 10000, // $100 per share
        },
        quantity: shares,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard/purchase-success`,
      cancel_url: `${process.env.CLIENT_URL}/buy`,
      metadata: {
        phone,
        shares,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: 'Stripe session failed' });
  }
};

// ✅ PayPal Payment Integration
export const createPaypalOrder = async (req, res) => {
  try {
    const { shares, currency } = req.body;
    const basicAuth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');

    const order = await axios.post(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency || 'USD',
            value: (shares * 100).toFixed(2), // $100/share
          },
        }],
      },
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ id: order.data.id });
  } catch (err) {
    console.error('PayPal order error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'PayPal order creation failed' });
  }
};