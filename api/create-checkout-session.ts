
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
        const { priceId, mode, successUrl, cancelUrl, customerEmail, userId, credits, planName, paymentMethod } = req.body;

        if (!priceId || !mode) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Build success URL with session_id placeholder (Stripe will replace it)
        const successUrlWithSession = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`;

        const paymentTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
            paymentMethod === 'pix' ? ['pix'] : ['card'];

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: paymentTypes,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode as 'payment' | 'subscription',
            success_url: successUrlWithSession,
            cancel_url: cancelUrl,
            customer_email: customerEmail,
            metadata: {
                userId: userId || '',
                credits: credits ? credits.toString() : '0',
                planName: planName || '',
            },
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
