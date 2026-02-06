import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function buffer(readable: any) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
        } else {
            // For testing without webhook secret
            event = JSON.parse(buf.toString()) as Stripe.Event;
        }
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('Stripe payment completed:', session.id);
        console.log('Metadata:', session.metadata);

        const credits = parseInt(session.metadata?.credits || '0', 10);
        const userId = session.metadata?.userId;
        const customerEmail = session.customer_email;

        if (credits > 0) {
            try {
                let userDocRef;

                // Try to find user by userId or email
                if (userId) {
                    userDocRef = db.collection('users').doc(userId);
                    const userDoc = await userDocRef.get();

                    if (userDoc.exists) {
                        const currentCredits = userDoc.data()?.credits || 0;
                        await userDocRef.update({
                            credits: currentCredits + credits
                        });
                        console.log(`Added ${credits} credits to user ${userId}. New total: ${currentCredits + credits}`);
                    }
                } else if (customerEmail) {
                    // Find user by email
                    const usersSnapshot = await db.collection('users')
                        .where('email', '==', customerEmail)
                        .limit(1)
                        .get();

                    if (!usersSnapshot.empty) {
                        const userDoc = usersSnapshot.docs[0];
                        const currentCredits = userDoc.data()?.credits || 0;
                        await userDoc.ref.update({
                            credits: currentCredits + credits
                        });
                        console.log(`Added ${credits} credits to user with email ${customerEmail}. New total: ${currentCredits + credits}`);
                    }
                }
            } catch (error) {
                console.error('Error updating credits:', error);
            }
        }
    }

    return res.status(200).json({ received: true });
}
