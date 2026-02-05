
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { AbacatePay } from 'abacatepay'; // Dynamic import used

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Create AbacatePay Checkout Session Endpoint
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
        const bills = await abacatePay.billing.list();
        // Look for bill with matching ID manually if list logic doesn't support filtering by ID directly in this SDK version
        const bill = bills.data.find(b => b.id === billId);

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        return res.status(200).json({
            customerEmail: bill.customer?.metadata?.email || bill.customer?.email,
            planName: bill.products?.[0]?.externalId || '',
            credits: bill.customer?.metadata?.credits || '0',
            paymentStatus: bill.status,
            metadata: bill.customer?.metadata
        });

    } catch (error) {
        console.error('AbacatePay Bill Fetch Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`🥑 AbacatePay Key: ${process.env.ABACATE_PAY_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
});
