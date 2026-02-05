
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

        // Build return URLs
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'] || 'render-xyz.vercel.app';
        const baseUrl = `${protocol}://${host}`;

        console.log('Creating billing with PIX + CARD:', { amount, planName });

        // Use billing/create with both PIX and CARD methods
        // Note: CARD is in beta according to docs
        const response = await fetch(`${ABACATE_API}/billing/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                frequency: "ONE_TIME",
                methods: ["PIX", "CARD"], // Enable both payment methods
                products: [
                    {
                        externalId: planName || 'plano-renderxyz',
                        name: description || `Plano ${planName || 'RenderXYZ'}`,
                        description: description || `Assinatura do plano ${planName || 'RenderXYZ'}`,
                        quantity: 1,
                        price: amount
                    }
                ],
                returnUrl: baseUrl,
                completionUrl: `${baseUrl}/?payment=success&plan=${encodeURIComponent(planName || '')}`,
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

        // billing/create returns URL to payment page
        const paymentData = data.data;

        if (!paymentData || !paymentData.url) {
            return res.status(500).json({ error: 'URL de pagamento não gerada', details: data });
        }

        return res.status(200).json({
            url: paymentData.url,
            id: paymentData.id
        });

    } catch (error: any) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: error.message || 'Erro interno' });
    }
}
