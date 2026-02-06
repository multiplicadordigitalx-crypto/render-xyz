
import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin se necessário
if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount)
            });
        } catch (error) {
            console.error('Erro ao parsear FIREBASE_SERVICE_ACCOUNT:', error);
        }
    }
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { event, payment } = req.body;

    // Validar token do webhook se configurado no Asaas (recomendado)
    const asaasAccessToken = req.headers['asaas-access-token'];
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

    if (expectedToken && asaasAccessToken !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`Received Asaas Webhook: ${event}`, payment.id);

    try {
        if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
            // Pagamento confirmado!

            // Buscar userId e credits dos metadados (se salvamos no banco do asaas em metadata - espero que sim)
            // Caso Asaas não retorne metadata no payload do webhook, precisamos buscar o pagamento novamente ou confiar no ExternalReference

            // ExternalReference foi definido como userId
            const userId = payment.externalReference;
            // Mas precisamos saber quantos créditos eram. Vamos tentar ler 'credit count' da descrição ou ter salvo um pedido no nosso banco antes.
            // O Asaas permite metadata customizado? Vimos no create endpoint que passamos metadata.
            // Mas o payload do webhook 'payment' normalmente não traz todo o metadata aninhado dependendo da versão.

            // Vamos prevenir erros: buscar o pagamento completo no Asaas se faltar dados, ou confiar na descrição
            // "100 Créditos RenderXYZ..."

            let creditsToAdd = 0;

            // Tentar extrair da descrição primeiro (mais rápido)
            const descriptionMatch = payment.description?.match(/^(\d+)/);
            if (descriptionMatch) {
                creditsToAdd = parseInt(descriptionMatch[1], 10);
            }

            // Se falhar ou userId for inválido
            if (!userId) {
                console.error('Webhook Error: No userId (externalReference) found in payment');
                return res.status(200).json({ received: true, error: 'No userId found' });
            }

            if (creditsToAdd > 0) {
                // Atualizar créditos no Firestore
                const userRef = db.collection('users').doc(userId);

                await db.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists) {
                        throw new Error("User does not exist!");
                    }

                    const currentCredits = userDoc.data()?.credits || 0;
                    const newCredits = currentCredits + creditsToAdd;

                    transaction.update(userRef, { credits: newCredits });

                    // Adicionar ao histórico de transações (opcional, mas bom)
                    const transactionRef = db.collection('transactions').doc();
                    transaction.set(transactionRef, {
                        userId,
                        amount: creditsToAdd,
                        type: 'credit_purchase',
                        provider: 'asaas',
                        paymentId: payment.id,
                        value: payment.value,
                        timestamp: new Date()
                    });
                });

                console.log(`Credits added successfully for user ${userId}: +${creditsToAdd}`);
            }
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook process error:', error);
        return res.status(500).json({ error: error.message });
    }
}
