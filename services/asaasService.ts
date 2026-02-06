
export interface AsaasPixResponse {
    id: string;
    netValue: number;
    status: string;
    invoiceUrl: string;
    pixQrCode?: string;
    pixQrCodeBase64?: string;
}

export const asaasService = {
    async createPixCharge(params: {
        amount: number; // em centavos
        description: string;
        customer: {
            name: string;
            email: string;
            cpfCnpj: string;
        };
        userId: string;
        credits: number;
    }): Promise<AsaasPixResponse> {
        const response = await fetch('/api/create-asaas-pix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar cobrança PIX');
        }

        return response.json();
    },

    async getPixQrCode(paymentId: string): Promise<{ encodedImage: string; payload: string }> {
        const response = await fetch(`/api/get-asaas-pix-qrcode?id=${paymentId}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar QR Code');
        }

        return response.json();
    }
};
