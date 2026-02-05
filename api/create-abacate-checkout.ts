
import { VercelRequest, VercelResponse } from '@vercel/node';

const ABACATE_API_URL = 'https://api.abacatepay.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const apiKey = process.env.ABACATE_PAY_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Missing API Key' });
        }

        const { amount, description, planName, customerEmail } = req.body;
        if (!amount) {
            return res.status(400).json({ error: 'Missing amount' });
        }

        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'];
        const baseUrl = `${protocol}://${host}`;

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        // Step 1: Create or find a customer
        // Using a default customer for anonymous purchases
        const email = customerEmail || 'cliente@renderxyz.com';

        console.log('Step 1: Creating customer...');
        const customerResponse = await fetch(`${ABACATE_API_URL}/customer/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Cliente RenderXYZ',
                email: email,
                cellphone: '11999999999',
                taxId: '00000000000'
            })
        });

        const customerData = await customerResponse.json();
        console.log('Customer Response:', JSON.stringify(customerData, null, 2));

        // Get customer ID (from new creation or error message if already exists)
        let customerId = customerData.data?.id;

        // If customer already exists, the API might return the existing one or an error
        // Try to proceed with billing anyway
        if (!customerId && customerData.data) {
            customerId = customerData.data.id;
        }

        console.log('Customer ID:', customerId);

        // Step 2: Create billing with customer ID
        console.log('Step 2: Creating billing...');
        const billingPayload: any = {
            frequency: "ONE_TIME",
            methods: ["PIX"],
            products: [
                {
                    externalId: planName || 'credits',
                    name: description || 'Créditos RenderXYZ',
                    description: description || 'Compra de créditos',
                    quantity: 1,
                    price: amount
                }
            ],
            returnUrl: `${baseUrl}/?payment=success`,
            completionUrl: `${baseUrl}/?payment=success`
        };

        // Add customer ID if we got one
        if (customerId) {
            billingPayload.customerId = customerId;
        }

        console.log('Billing Payload:', JSON.stringify(billingPayload, null, 2));

        const billingResponse = await fetch(`${ABACATE_API_URL}/billing/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify(billingPayload)
        });

        const billing = await billingResponse.json();
        console.log('Billing Response:', JSON.stringify(billing, null, 2));

        if (!billingResponse.ok || billing.error) {
            return res.status(billingResponse.status || 500).json({
                error: billing.error || 'AbacatePay Error',
                details: billing
            });
        }

        const paymentUrl = billing.data?.url;
        const billId = billing.data?.id;

        if (!paymentUrl) {
            return res.status(500).json({ error: 'No payment URL', details: billing });
        }

        return res.status(200).json({ url: paymentUrl, id: billId });

    } catch (error: any) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
