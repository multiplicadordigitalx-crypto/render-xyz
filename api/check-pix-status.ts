
import { VercelRequest, VercelResponse } from '@vercel/node';

const ABACATE_API = 'https://api.abacatepay.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.ABACATE_PAY_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Erro de configuração' });
    }

    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'ID do pagamento não fornecido' });
        }

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        // First try to get billing status using the list endpoint
        // AbacatePay doesn't have a direct /billing/:id endpoint, so we check the list
        const response = await fetch(`${ABACATE_API}/billing/list`, {
            method: 'GET',
            headers
        });

        const data = await response.json();
        console.log('Billing list response for ID check:', id);

        if (!response.ok) {
            console.error('Error from AbacatePay:', data);
            return res.status(response.status || 500).json({
                error: data.error || 'Erro ao verificar pagamento'
            });
        }

        // Find the billing with matching ID
        const billings = data.data || [];
        const billing = billings.find((b: any) => b.id === id);

        if (!billing) {
            // Billing not found - might still be processing
            return res.status(200).json({
                status: 'PENDING',
                message: 'Pagamento em processamento'
            });
        }

        console.log('Found billing:', billing.id, 'Status:', billing.status);

        return res.status(200).json({
            status: billing.status || 'PENDING',
            paidAt: billing.paidAt,
            amount: billing.amount,
            billingId: billing.id
        });

    } catch (error: any) {
        console.error('Error checking payment status:', error);
        return res.status(500).json({ error: error.message || 'Erro interno' });
    }
}
