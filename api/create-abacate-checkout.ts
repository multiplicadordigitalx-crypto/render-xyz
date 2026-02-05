
import { VercelRequest, VercelResponse } from '@vercel/node';
import { AbacatePay } from 'abacatepay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Production Logic: Strictly use environment variable
        const apiKey = process.env.ABACATE_PAY_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL: ABACATE_PAY_API_KEY is missing in Vercel Environment Variables.");
            return res.status(500).json({ error: 'Server Configuration Error: Missing Payment Key' });
        }

        // Initialize AbacatePay
        const abacatePay = new AbacatePay(apiKey);

        const { amount, description, customerEmail, userId, credits, planName, frequency } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Missing required parameters: amount' });
        }

        // Determine base URL dynamically
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers['host'];
        const returnUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

        console.log('Creating AbacatePay session:', { amount, planName, returnUrl });

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

        if (!paymentUrl) {
            console.error('AbacatePay verification:', billing);
            throw new Error('Failed to generate payment URL - AbacatePay returned no URL');
        }

        return res.status(200).json({ url: paymentUrl, id: billId });

    } catch (error: any) {
        console.error('AbacatePay API Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        });
    }
}
