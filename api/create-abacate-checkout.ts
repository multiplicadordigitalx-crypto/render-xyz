
import { VercelRequest, VercelResponse } from '@vercel/node';

const ABACATE_API = 'https://api.abacatepay.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.ABACATE_PAY_API_KEY;
    if (!apiKey) {
        console.error('Missing ABACATE_PAY_API_KEY');
        return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    try {
        const { amount, planName, description } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Valor inválido' });
        }

        console.log('Creating PIX QR Code:', { amount, planName });

        // Use PIX QR Code endpoint - simpler, no customer required
        const response = await fetch(`${ABACATE_API}/pixQrCode/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                description: description || `Plano ${planName || 'RenderXYZ'}`,
                expiresIn: 3600, // 1 hour expiration
                metadata: {
                    planName: planName || 'credits',
                    type: 'subscription'
                }
            })
        });

        const data = await response.json();
        console.log('AbacatePay Response:', JSON.stringify(data, null, 2));

        if (!response.ok || data.error) {
            console.error('AbacatePay Error:', data);
            return res.status(response.status || 500).json({
                error: data.error || data.message || 'Erro ao criar pagamento',
                details: data
            });
        }

        // PIX QR Code response has: brCode, qrCodeBase64, expiresAt, id
        // Return a URL that shows the QR code or the brCode for copy/paste
        const paymentData = data.data;

        if (!paymentData) {
            return res.status(500).json({ error: 'Resposta inválida do servidor de pagamento' });
        }

        return res.status(200).json({
            id: paymentData.id,
            brCode: paymentData.brCode,
            qrCodeBase64: paymentData.qrCodeBase64,
            expiresAt: paymentData.expiresAt,
            amount: paymentData.amount
        });

    } catch (error: any) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: error.message || 'Erro interno' });
    }
}
