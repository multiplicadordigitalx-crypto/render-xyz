
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const apiKey = process.env.ASAAS_API_KEY;
    const apiUrl = process.env.ASAAS_API_URL || 'https://www.asaas.com/api/v3';

    if (!id) {
        return res.status(400).json({ error: 'Payment ID required' });
    }

    try {
        const response = await fetch(`${apiUrl}/payments/${id}/pixQrCode`, {
            method: 'GET',
            headers: {
                'access_token': apiKey || ''
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.description || 'Erro ao buscar QR Code');
        }

        return res.status(200).json(data);

    } catch (error: any) {
        console.error('Asaas QR Code Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
