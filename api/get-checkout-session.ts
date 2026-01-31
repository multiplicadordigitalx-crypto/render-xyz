
import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-01-28.clover',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { session_id } = req.query;

        if (!session_id || typeof session_id !== 'string') {
            return res.status(400).json({ error: 'Missing session_id parameter' });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        return res.status(200).json({
            customerEmail: session.customer_email,
            planName: session.metadata?.planName || '',
            credits: session.metadata?.credits || '0',
            paymentStatus: session.payment_status,
            subscriptionId: session.subscription,
        });
    } catch (error: any) {
        console.error('Stripe Session Retrieve Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
