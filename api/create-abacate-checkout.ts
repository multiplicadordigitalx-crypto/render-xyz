
import { VercelRequest, VercelResponse } from '@vercel/node';

const ABACATE_API_URL = 'https://api.abacatepay.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const apiKey = process.env.ABACATE_PAY_API_KEY;
        if (!apiKey) {
            console.error('Missing ABACATE_PAY_API_KEY');
            return res.status(500).json({ error: 'Configuração do servidor inválida' });
        }

        const { amount, planName, description } = req.body;

        if (!amount || typeof amount !== 'number') {
            return res.status(400).json({ error: 'Valor inválido' });
        }

        // Build URLs
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'] || 'render-xyz.vercel.app';
        const baseUrl = `${protocol}://${host}`;

        // Payload conforme documentação oficial AbacatePay
        // https://docs.abacatepay.com/api-reference/criar-uma-nova-cobrança
        const payload = {
            frequency: "ONE_TIME",
            methods: ["PIX"],
            products: [
                {
                    externalId: planName || 'plano-renderxyz',
                    name: description || 'Plano RenderXYZ',
                    description: description || 'Assinatura do plano RenderXYZ',
                    quantity: 1,
                    price: amount // Em centavos
                }
            ],
            returnUrl: baseUrl,
            completionUrl: `${baseUrl}/?payment=success`
        };

        console.log('AbacatePay Request:', JSON.stringify(payload, null, 2));

        const response = await fetch(`${ABACATE_API_URL}/billing/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('AbacatePay Response:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('AbacatePay Error:', data);
            return res.status(response.status).json({
                error: data.error || data.message || 'Erro ao criar cobrança',
                details: data
            });
        }

        if (!data.data?.url) {
            console.error('No URL in response:', data);
            return res.status(500).json({ error: 'URL de pagamento não gerada' });
        }

        return res.status(200).json({
            url: data.data.url,
            id: data.data.id
        });

    } catch (error: any) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: error.message || 'Erro interno' });
    }
}
