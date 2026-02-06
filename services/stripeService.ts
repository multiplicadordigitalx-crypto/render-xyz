interface CreateCheckoutParams {
    amount: number;
    credits: number;
    customerEmail?: string;
    userId?: string;
}

export const stripeService = {
    async createCheckoutSession(params: CreateCheckoutParams) {
        const response = await fetch('/api/create-stripe-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: params.amount,
                credits: params.credits,
                customerEmail: params.customerEmail,
                userId: params.userId
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Store pending info before redirect
        if (data.sessionId) {
            sessionStorage.setItem('pendingStripeSession', data.sessionId);
            sessionStorage.setItem('pendingCredits', params.credits.toString());
        }

        // Redirect to Stripe Checkout
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('URL de pagamento não retornada');
        }
    }
};
