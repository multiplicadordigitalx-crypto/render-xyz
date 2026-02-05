
import { VercelRequest, VercelResponse } from '@vercel/node';
import AbacatePay from 'abacatepay-nodejs-sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { billId } = req.query;

        if (!billId || typeof billId !== 'string') {
            return res.status(400).json({ error: 'Missing billId parameter' });
        }

        const apiKey = process.env.ABACATE_PAY_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server Config Error: Missing Key' });
        }

        const abacatePay = AbacatePay(apiKey);

        // Fetch bill details
        const bills = await abacatePay.billing.list();
        const bill = bills.data.find((b: any) => b.id === billId);

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

    } catch (error: any) {
        console.error('AbacatePay Bill Fetch Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
