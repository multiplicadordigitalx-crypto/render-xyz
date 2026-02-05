
import { VercelRequest, VercelResponse } from '@vercel/node';
// import { AbacatePay } from 'abacatepay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const event = req.body;
        console.log('AbacatePay Webhook Received:', event);

        // Verify signature if possible (skipped for now as per plan)

        // Handle event
        // Assuming event structure has 'data' and 'event' type or similar.
        // Docs provided didn't specify webhook payload structure definitively.
        // We log it for now.

        if (event.status === 'PAID' || event.data?.status === 'PAID') {
            console.log('Payment Paid Event');
            // Logic to update Firebase would go here using Admin SDK
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
