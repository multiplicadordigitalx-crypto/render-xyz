
import { VercelRequest, VercelResponse } from '@vercel/node';

// AbacatePay API Base URL (from SDK source)
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

        const { amount, description, customerEmail, userId, credits, planName, frequency } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Missing required parameter: amount' });
        }

        // Determine base URL dynamically for redirects
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'];
        const returnUrl = `${protocol}://${host}/?payment=success`;

        console.log('Creating AbacatePay billing via direct API:', { amount, planName, returnUrl });

        // Direct API call to AbacatePay
        const response = await fetch(`${ABACATE_API_URL}/billing/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'RenderXYZ/1.0'
            },
            body: JSON.stringify({
                frequency: frequency || 'ONE_TIME',
                methods: ['PIX'],
                products: [
                    {
                        externalId: planName || 'default',
                        name: description || 'Credits',
                        quantity: 1,
                        price: amount,
                        description: description || 'Service',
                    }
                ],
                returnUrl: returnUrl,
                completionUrl: returnUrl,
                customer: customerEmail ? {
                    email: customerEmail
                } : undefined
            })
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

        // The API returns data.url and data.id
        const paymentUrl = billing.data?.url;
        const billId = billing.data?.id;

        if (!paymentUrl) {
            console.error('AbacatePay: No payment URL returned', billing);
            return res.status(500).json({ error: 'Failed to generate payment URL' });
        }

        return res.status(200).json({ url: paymentUrl, id: billId });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error'
        });
    }
}
