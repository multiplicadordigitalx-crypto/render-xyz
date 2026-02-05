
interface CreateCheckoutParams {
    amount: number;
    planName: string;
    description?: string;
}

interface PixPaymentResponse {
    id: string;
    brCode: string;
    qrCodeBase64: string;
    expiresAt: string;
    amount: number;
}

export const abacatePayService = {
    async createCheckoutSession(params: CreateCheckoutParams): Promise<PixPaymentResponse> {
        const response = await fetch('/api/create-abacate-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: params.amount,
                planName: params.planName,
                description: params.description || `Assinatura ${params.planName}`
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Store payment ID for verification after payment
        if (data.id) {
            sessionStorage.setItem('pendingPixPaymentId', data.id);
            sessionStorage.setItem('pendingPlanName', params.planName);
        }

        return data;
    },

    async checkPaymentStatus(pixId: string): Promise<{ status: string }> {
        const response = await fetch(`/api/check-pix-status?id=${pixId}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    }
};
