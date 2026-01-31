
interface CheckoutSessionParams {
    priceId: string;
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    userId?: string;
    credits?: number;
    planName?: string;
    paymentMethod?: 'card' | 'pix';
}

export const stripeService = {
    async redirectToCheckout(params: CheckoutSessionParams) {
        try {
            // 1. Create Session via our API
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            const { sessionId, url, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

            // 2. Redirect to Stripe Checkout using the URL directly
            if (url) {
                window.location.assign(url);
            } else {
                throw new Error('No checkout URL returned from server');
            }
        } catch (err) {
            console.error('Payment Error:', err);
            throw err;
        }
    },

    async getCheckoutSession(sessionId: string) {
        try {
            const response = await fetch(`/api/get-checkout-session?session_id=${sessionId}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        } catch (err) {
            console.error('Session Retrieve Error:', err);
            throw err;
        }
    },
};
