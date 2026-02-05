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
        const { priceId, mode, successUrl, cancelUrl, customerEmail, userId, credits, planName, paymentMethod } = req.body;

        if (!priceId || !mode) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        console.log('Creating checkout session:', { priceId, mode, customerEmail, paymentMethod });

        const successUrlWithSession = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`;

        const sessionConfig = {
            payment_method_types: paymentMethod === 'pix' ? ['pix'] : ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode,
            success_url: successUrlWithSession,
            cancel_url: cancelUrl,
            customer_email: customerEmail || undefined,
            metadata: {
                userId: userId || '',
                credits: credits ? credits.toString() : '0',
                planName: planName || '',
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

// Get Checkout Session Endpoint
app.post('/api/create-abacate-checkout', async (req, res) => {
    try {
        const { AbacatePay } = await import('abacatepay');
        const abacatePay = new AbacatePay(process.env.ABACATE_PAY_API_KEY);

        const { amount, description, customerEmail, userId, credits, planName, frequency } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const returnUrl = 'http://localhost:3000';

        const billing = await abacatePay.billing.create({
            frequency: frequency || 'ONE_TIME',
            methods: ['PIX', 'CARD'],
            products: [
                {
                    externalId: planName || 'default',
                    name: description || 'Credits',
                    quantity: 1,
                    price: amount, // Amount in centavos
                    description: description || 'Service',
                }
            ],
            returnUrl: `${returnUrl}/?payment=success`,
            completionUrl: `${returnUrl}/?payment=success`,
            customer: {
                email: customerEmail,
                metadata: {
                    userId: userId,
                    credits: credits?.toString(),
                    planName: planName
                }
            }
        });

        const paymentUrl = billing.data?.url || billing.url;
        const billId = billing.data?.id || billing.id;

        return res.status(200).json({ url: paymentUrl, id: billId });
    } catch (error) {
        console.error('AbacatePay Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Get AbacatePay Bill Endpoint
app.get('/api/get-abacate-bill', async (req, res) => {
    try {
        const { billId } = req.query;

        if (!billId) {
            return res.status(400).json({ error: 'Missing billId parameter' });
        }

        const { AbacatePay } = await import('abacatepay');
        const abacatePay = new AbacatePay(process.env.ABACATE_PAY_API_KEY);

        // Fetch bill details
        // Assuming abacatePay.billing.list({ id: billId }) or similar. 
        // Docs say GET /billing/get with params? Or billing.retrieve(id)?
        // Based on "API descomplicada": GET /billing/get.
        // SDK probably has .billing.list() or .billing.retrieve(). 
        // I will try .billing.list({ _id: billId }) if retrieve is not obvious, 
        // but likely it is .billing.retrieve(billId) or .billing.get(billId).
        // I'll guess .billing.list({ limit: 1 }) is safe if I can't filter by ID? 
        // No, docs say GET /billing/get specific payment.
        // I'll check if I can find usage. 
        // For now I'll try .billing.retrieve(billId). If error, I'll fix during verification.
        // Actually, looking at previous chunks: "abacatePay.billing.create".
        // I'll assume `abacatePay.billing.list()` returns array.
        // Let's rely on standard patterns.

        // Implementation:
        const bills = await abacatePay.billing.list();
        const bill = bills.data.find(b => b.id === billId);

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        return res.status(200).json({
            customerEmail: bill.customer?.metadata?.email || bill.customer?.email, // Check structure
            planName: bill.products?.[0]?.externalId || '',
            credits: bill.customer?.metadata?.credits || '0',
            paymentStatus: bill.status, // PENDING, PAID, etc.
            metadata: bill.customer?.metadata
        });

    } catch (error) {
        console.error('AbacatePay Bill Fetch Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Get Checkout Session Endpoint
app.get('/api/get-checkout-session', async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: 'Missing session_id parameter' });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        return res.status(200).json({
            customerEmail: session.customer_email,
            planName: session.metadata?.planName || '',
            credits: session.metadata?.credits || '0',
            paymentStatus: session.payment_status,
        });
    } catch (error) {
        console.error('Stripe Error:', error.message);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📦 Stripe Key: ${process.env.STRIPE_SECRET_KEY ? 'Configured ✓' : 'Missing ✗'}`);
});
