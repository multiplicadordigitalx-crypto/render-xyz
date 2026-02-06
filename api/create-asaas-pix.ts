
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, description, customer, userId, credits } = req.body;

    if (!amount || !customer || !userId || !credits) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.ASAAS_API_KEY;
    const apiUrl = process.env.ASAAS_API_URL || 'https://www.asaas.com/api/v3';

    if (!apiKey) {
        console.error('ASAAS_API_KEY not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // Sanitize CPF (remove non-digits)
        const sanitizedCpf = customer.cpfCnpj.replace(/\D/g, '');

        // 1. Criar ou buscar o cliente no Asaas
        let customerId = '';

        // Tentar buscar cliente pelo email ou CPF
        const textSearch = sanitizedCpf || customer.email;
        /* 
           Nota: O endpoint /customers do Asaas aceita cpfCnpj ou email como filtro
           mas a busca exata é melhor. Vamos tentar buscar pelo CPF primeiro se existir.
        */

        let searchUrl = `${apiUrl}/customers?email=${customer.email}`;
        if (sanitizedCpf) {
            searchUrl = `${apiUrl}/customers?cpfCnpj=${sanitizedCpf}`;
        }

        const findCustomerRes = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'access_token': apiKey
            }
        });

        if (!findCustomerRes.ok) {
            console.error('Error searching customer:', findCustomerRes.status, await findCustomerRes.text());
            // Don't throw yet, try to create
        } else {
            const findCustomerData = await findCustomerRes.json();
            if (findCustomerData.data && findCustomerData.data.length > 0) {
                customerId = findCustomerData.data[0].id;
            }
        }

        if (!customerId) {
            // Criar cliente
            const createCustomerRes = await fetch(`${apiUrl}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': apiKey
                },
                body: JSON.stringify({
                    name: customer.name,
                    email: customer.email,
                    cpfCnpj: sanitizedCpf || undefined
                })
            });

            const newCustomerData = await createCustomerRes.json();
            if (createCustomerRes.ok) {
                customerId = newCustomerData.id;
            } else {
                console.error('Error creating Asaas customer:', JSON.stringify(newCustomerData));
                const detail = newCustomerData.errors?.[0]?.description || 'Erro desconhecido ao criar cliente';
                throw new Error(`Erro Cliente: ${detail}`);
            }
        }

        // 2. Criar a Cobrança
        const chargePayload = {
            customer: customerId,
            billingType: 'PIX',
            value: amount / 100,
            dueDate: new Date().toISOString().split('T')[0],
            description: description,
            externalReference: userId,
            metadata: {
                userId: userId,
                credits: credits,
                source: 'render-xyz'
            }
        };

        console.log('Creating Asaas Charge:', JSON.stringify(chargePayload));

        const chargeRes = await fetch(`${apiUrl}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': apiKey
            },
            body: JSON.stringify(chargePayload)
        });

        const chargeData = await chargeRes.json();

        if (!chargeRes.ok) {
            console.error('Error creating Asaas charge:', JSON.stringify(chargeData));
            const detail = chargeData.errors?.[0]?.description || 'Erro desconhecido ao criar cobrança';
            throw new Error(`Erro Cobrança: ${detail}`);
        }

        return res.status(200).json(chargeData);

    } catch (error: any) {
        console.error('Asaas API Logic Error:', error);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}
