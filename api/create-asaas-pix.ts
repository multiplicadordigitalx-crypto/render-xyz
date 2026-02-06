
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
        // 1. Criar ou buscar o cliente no Asaas (simplificado: tenta criar sempre, se existir o Asaas pode retornar o existente ou erro - melhor buscar antes se for complexo, mas para MVP vamos criar direto a cobrança com dados do cliente se o Asaas permitir inline ou criar cliente primeiro)

        // Passo 1: Criar Cliente
        let customerId = '';

        // Tentar buscar cliente pelo email/cpf primeiro seria o ideal, mas vamos tentar criar um novo
        // O Asaas não duplica se CPF for igual, ele retorna o ID existente geralmente, ou erro.
        // Vamos fazer busca primeiro.

        const findCustomerRes = await fetch(`${apiUrl}/customers?cpfCnpj=${customer.cpfCnpj}`, {
            method: 'GET',
            headers: {
                'access_token': apiKey
            }
        });

        const findCustomerData = await findCustomerRes.json();

        if (findCustomerData.data && findCustomerData.data.length > 0) {
            customerId = findCustomerData.data[0].id;
        } else {
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
                    cpfCnpj: customer.cpfCnpj
                })
            });

            const newCustomerData = await createCustomerRes.json();
            if (createCustomerRes.ok) {
                customerId = newCustomerData.id;
            } else {
                console.error('Error creating Asaas customer:', newCustomerData);
                throw new Error(newCustomerData.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
            }
        }

        // 2. Criar a Cobrança
        const chargeRes = await fetch(`${apiUrl}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': apiKey
            },
            body: JSON.stringify({
                customer: customerId,
                billingType: 'PIX',
                value: amount / 100, // Asaas recebe em reais (float), não centavos
                dueDate: new Date().toISOString().split('T')[0], // Vence hoje
                description: description,
                externalReference: userId, // Usamos ID do usuário como ref externa ou metadata
                metadata: {
                    userId: userId,
                    credits: credits,
                    source: 'render-xyz'
                }
            })
        });

        const chargeData = await chargeRes.json();

        if (!chargeRes.ok) {
            console.error('Error creating Asaas charge:', chargeData);
            throw new Error(chargeData.errors?.[0]?.description || 'Erro ao criar cobrança no Asaas');
        }

        // 3. Obter QR Code e Payload (Copia e Cola)
        // O endpoint de criação já retorna ID, mas o QR Code geralmente pega em outro endpoint ou vem no response?
        // Na v3 do Asaas, criação nem sempre retorna o QR Code Payload direto se não for billingType PIX e imediato.
        // Mas vamos retornar o ID da cobrança e o front chama o endpoint de QR Code separadamente para garantir.

        return res.status(200).json(chargeData);

    } catch (error: any) {
        console.error('Asaas API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
