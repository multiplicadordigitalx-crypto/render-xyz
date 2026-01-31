import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-12-18.acacia' as any,
});

// In production, use Firebase Admin SDK
// For now, we'll return success and handle credits client-side
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (webhookSecret) {
            // Verify webhook signature in production
            const rawBody = await getRawBody(req);
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } else {
            // For local testing without signature verification
            event = req.body as Stripe.Event;
        }

        console.log('Webhook event received:', event.type);

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('Payment successful:', session.id);
                console.log('Metadata:', session.metadata);

                const userId = session.metadata?.userId;
                const credits = parseInt(session.metadata?.credits || '0', 10);

                if (userId && credits > 0) {
                    // TODO: Update Firestore with Firebase Admin SDK
                    // For now, log the details
                    console.log(`Should add ${credits} credits to user ${userId}`);

                    // Store in a simple way for client-side pickup
                    // In production, use Firebase Admin SDK
                }

                break;
            }
            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('Subscription created:', subscription.id);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error.message);
        return res.status(400).json({ error: error.message });
    }
}

// Helper to get raw body for signature verification
async function getRawBody(req: VercelRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            resolve(Buffer.from(data));
        });
        req.on('error', reject);
    });
}
