import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3002;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
});

app.use(cors());
app.use(express.json());

// Checkout Session Endpoint
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, mode, successUrl, cancelUrl, customerEmail, userId, credits } = req.body;

        if (!priceId || !mode) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        console.log('Creating checkout session:', { priceId, mode, customerEmail });

        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode,
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: customerEmail || undefined,
            metadata: {
                userId: userId || '',
                credits: credits ? credits.toString() : '0',
            },
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log('Session created:', session.id);
        return res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe Error:', error.message);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📦 Stripe Key: ${process.env.STRIPE_SECRET_KEY ? 'Configured ✓' : 'Missing ✗'}`);
});
