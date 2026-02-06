import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { amount, credits, customerEmail, userId } = req.body;

        if (!amount || !credits) {
            return res.status(400).json({ error: 'Amount and credits are required' });
        }

        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'https://render-xyz.vercel.app';

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: customerEmail || undefined,
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: `${credits} Créditos RenderXYZ`,
                            description: `Pacote de ${credits} créditos para renderização de alta qualidade`,
                        },
                        unit_amount: amount, // Amount in centavos
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                credits: credits.toString(),
                userId: userId || '',
            },
            success_url: `${baseUrl}/?payment=success&method=stripe&credits=${credits}`,
            cancel_url: `${baseUrl}/?payment=canceled`,
        });

        console.log('Stripe session created:', session.id);

        return res.status(200).json({
            url: session.url,
            sessionId: session.id,
        });

    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return res.status(500).json({ error: error.message || 'Erro ao criar sessão de pagamento' });
    }
}
