
interface CreateAbacateCheckoutParams {
    priceId: string; // Used to identify the plan, though AbacatePay uses amount
    amount: number; // AbacatePay needs amount in centavos
    planName: string;
    customerEmail?: string;
    userId?: string;
    credits?: number;
    description: string;
    frequency?: 'ONE_TIME' | 'MONTHLY' | 'YEARLY'; // AbacatePay frequency
}

export const abacatePayService = {
    async createCheckoutSession(params: CreateAbacateCheckoutParams) {
        try {
            const response = await fetch('/api/create-abacate-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.url) {
                if (data.id) {
                    sessionStorage.setItem('pendingAbacateBillId', data.id);
                }
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            console.error('AbacatePay Checkout Error:', err);
            throw err;
        }
    },

    async getBill(billId: string) {
        try {
            const response = await fetch(`/api/get-abacate-bill?billId=${billId}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        } catch (err) {
            console.error('Bill Retrieve Error:', err);
            throw err;
        }
    }
};
