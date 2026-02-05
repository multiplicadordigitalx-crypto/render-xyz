
import { VercelRequest, VercelResponse } from '@vercel/node';

// AbacatePay API Base URL (from official docs)
const ABACATE_API_URL = 'https://api.abacatepay.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.ABACATE_PAY_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL: Missing ABACATE_PAY_API_KEY");
            return res.status(500).json({ error: 'Server Config Error: Missing Key' });
        }

        const { amount, description, planName } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Missing required parameter: amount' });
        }

        // Determine base URL dynamically for redirects
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'];
        const baseUrl = `${protocol}://${host}`;

        console.log('Creating AbacatePay billing:', { amount, planName, baseUrl });

        // Minimal payload - NO customer (customer fills in their data on payment page)
        // According to docs, customer is optional and can be filled by buyer
        const payload = {
            frequency: "ONE_TIME",
            methods: ["PIX"],
            products: [
                {
                    externalId: planName || 'credits',
                    name: description || 'Créditos RenderXYZ',
                    description: description || 'Compra de créditos para renderização',
                    quantity: 1,
                    price: amount
                }
            ],
            returnUrl: `${baseUrl}/?payment=success`,
            completionUrl: `${baseUrl}/?payment=success`
        };

        console.log('AbacatePay Request Payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(`${ABACATE_API_URL}/billing/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const billing = await response.json();

        console.log('AbacatePay Response:', JSON.stringify(billing, null, 2));

        if (!response.ok || billing.error) {
            console.error('AbacatePay API Error:', billing);
            return res.status(response.status || 500).json({
                error: billing.error || billing.message || 'AbacatePay API Error',
                details: billing
            });
        }

        const paymentUrl = billing.data?.url;
        const billId = billing.data?.id;

        if (!paymentUrl) {
            console.error('AbacatePay: No payment URL returned', billing);
            return res.status(500).json({ error: 'Failed to generate payment URL', details: billing });
        }

        return res.status(200).json({ url: paymentUrl, id: billId });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error'
        });
    }
}
