
import { VercelRequest, VercelResponse } from '@vercel/node';

const ABACATE_API = 'https://api.abacatepay.com/v1';

// Helper to generate a valid CPF (for testing purposes)
function generateValidCPF(): string {
    const random = (n: number) => Math.floor(Math.random() * n);
    const mod = (dividend: number, divisor: number) => Math.round(dividend - Math.floor(dividend / divisor) * divisor);

    const n = Array(9).fill(0).map(() => random(9));
    let d1 = n.reduce((acc, val, i) => acc + val * (10 - i), 0);
    d1 = 11 - mod(d1, 11);
    if (d1 >= 10) d1 = 0;

    let d2 = n.reduce((acc, val, i) => acc + val * (11 - i), 0) + d1 * 2;
    d2 = 11 - mod(d2, 11);
    if (d2 >= 10) d2 = 0;

    return `${n.join('')}${d1}${d2}`;
}

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

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const { amount, planName, description, customerEmail, customerName, userId } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Valor inválido' });
        }

        // Build return URLs
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'] || 'render-xyz.vercel.app';
        const baseUrl = `${protocol}://${host}`;

        console.log('Step 1: Creating customer...', { customerEmail, customerName, userId });

        // Step 1: Create a customer first
        // Use real user data if logged in, otherwise generate placeholder
        const email = customerEmail || `cliente_${Date.now()}@renderxyz.com`;
        const name = customerName || 'Cliente RenderXYZ';
        const cpf = generateValidCPF();

        const customerResponse = await fetch(`${ABACATE_API}/customer/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: name,
                email: email,
                cellphone: '11999999999',
                taxId: cpf
            })
        });

        const customerData = await customerResponse.json();
        console.log('Customer Response:', JSON.stringify(customerData, null, 2));

        // Get customer ID
        const customerId = customerData.data?.id;

        if (!customerId) {
            console.error('Failed to create customer:', customerData);
            return res.status(500).json({
                error: 'Não foi possível criar o cliente',
                details: customerData
            });
        }

        console.log('Customer ID:', customerId);
        console.log('Step 2: Creating billing...');

        // Step 2: Create billing with customerId
        const billingResponse = await fetch(`${ABACATE_API}/billing/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                frequency: "ONE_TIME",
                methods: ["PIX", "CARD"],
                products: [
                    {
                        externalId: planName || 'plano-renderxyz',
                        name: description || `Plano ${planName || 'RenderXYZ'}`,
                        description: description || `Assinatura do plano ${planName || 'RenderXYZ'}`,
                        quantity: 1,
                        price: amount
                    }
                ],
                returnUrl: `${baseUrl}/?payment=success&plan=${encodeURIComponent(planName || '')}`,
                completionUrl: `${baseUrl}/?payment=success&plan=${encodeURIComponent(planName || '')}`,
                customerId: customerId // Use the customer ID we just created
            })
        });

        const billingData = await billingResponse.json();
        console.log('Billing Response:', JSON.stringify(billingData, null, 2));

        if (!billingResponse.ok || billingData.error) {
            console.error('AbacatePay Billing Error:', billingData);
            return res.status(billingResponse.status || 500).json({
                error: billingData.error || billingData.message || 'Erro ao criar cobrança',
                details: billingData
            });
        }

        const paymentData = billingData.data;

        if (!paymentData || !paymentData.url) {
            return res.status(500).json({ error: 'URL de pagamento não gerada', details: billingData });
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
