
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as AbacatePaySDK from 'abacatepay-nodejs-sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log("Starting AbacatePay Checkout...");

        const apiKey = process.env.ABACATE_PAY_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL: Missing ABACATE_PAY_API_KEY");
            return res.status(500).json({ error: 'Server Config Error: Missing Key' });
        }

        // Handle CJS/ESM interop: The SDK exports 'default', so we might get the module object
        // cast to any to avoid TS errors during this runtime check
        const SdkImport = AbacatePaySDK as any;
        const AbacatePay = SdkImport.default || SdkImport;

        if (typeof AbacatePay !== 'function') {
            console.error("AbacatePay Import Error: Not a function", { type: typeof AbacatePay, keys: Object.keys(SdkImport) });
            return res.status(500).json({ error: 'Internal Error: Payment SDK Init Failed' });
        }

        // Initialize AbacatePay SDK
        const abacatePay = AbacatePay(apiKey);

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

        const paymentUrl = billing.data?.url;
        const billId = billing.data?.id;

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
