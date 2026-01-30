
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutSessionParams {
    priceId: string;
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    userId?: string;
    credits?: number;
}

export const stripeService = {
    async redirectToCheckout(params: CheckoutSessionParams) {
        try {
            // 1. Create Session via our Vercel API
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            const { sessionId, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

            // 2. Redirect to Stripe
            const stripe = await stripePromise;
            if (!stripe) throw new Error('Stripe failed to initialize');

            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId,
            });

            if (stripeError) {
                throw stripeError;
            }
        } catch (err) {
            console.error('Payment Error:', err);
            throw err;
        }
    },
};
