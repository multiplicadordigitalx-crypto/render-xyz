
import { VercelRequest, VercelResponse } from '@vercel/node';
import { AbacatePay } from 'abacatepay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Initialize AbacatePay
        // Note: Assuming the SDK is initialized this way based on docs. 
        // If not, we might need to adjust.
        const abacatePay = new AbacatePay(process.env.ABACATE_PAY_API_KEY as string);

        const { amount, description, customerEmail, userId, credits, planName, frequency } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
            throw new Error('Failed to generate payment URL');
        }

        return res.status(200).json({ url: paymentUrl, id: billId });

    } catch (error: any) {
        console.error('AbacatePay Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
