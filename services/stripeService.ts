
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
            // (redirectToCheckout is deprecated in newer Stripe.js versions)
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No checkout URL returned from server');
            }
        } catch (err) {
            console.error('Payment Error:', err);
            throw err;
        }
    },
};
