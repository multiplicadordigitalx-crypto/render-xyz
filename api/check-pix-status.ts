
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

        const response = await fetch(`${ABACATE_API}/pixQrCode/check?id=${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            return res.status(response.status || 500).json({
                error: data.error || 'Erro ao verificar pagamento'
            });
        }

        return res.status(200).json({
            status: data.data?.status || 'PENDING',
            paidAt: data.data?.paidAt,
            amount: data.data?.amount
        });

    } catch (error: any) {
        console.error('Error checking PIX status:', error);
        return res.status(500).json({ error: error.message || 'Erro interno' });
    }
}
