
import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-01-28.clover',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { priceId, mode, successUrl, cancelUrl, customerEmail, userId, credits } = req.body;

        if (!priceId || !mode) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode as 'payment' | 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: customerEmail,
            metadata: {
                userId: userId,
                credits: credits ? credits.toString() : '0', // For one-time purchases
            },
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
