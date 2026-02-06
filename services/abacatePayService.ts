
interface CreateCheckoutParams {
    amount: number;
    planName: string;
    description?: string;
    customerEmail?: string;
    customerName?: string;
    userId?: string;
}

export const abacatePayService = {
    async createCheckoutSession(params: CreateCheckoutParams) {
        const response = await fetch('/api/create-abacate-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: params.amount,
                planName: params.planName,
                description: params.description || `${params.planName}`,
                customerEmail: params.customerEmail,
                customerName: params.customerName,
                userId: params.userId
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Redirect to AbacatePay payment page (has both PIX and CARD options)
        if (data.url) {
            if (data.id) {
                sessionStorage.setItem('pendingBillId', data.id);
                sessionStorage.setItem('pendingPlanName', params.planName);
            }
            window.location.href = data.url;
        } else {
            throw new Error('URL de pagamento não retornada');
        }
    },

    async checkPaymentStatus(billId: string): Promise<{ status: string }> {
        const response = await fetch(`/api/check-pix-status?id=${billId}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    }
};
