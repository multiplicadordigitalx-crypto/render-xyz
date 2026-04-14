import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        return res.status(500).json({ error: 'Configuração incompleta: RESEND_API_KEY não encontrada no servidor.' });
    }

    const resend = new Resend(resendApiKey);

    const { name, email, phone, message } = req.body;

    // Validar campos
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Render XYZ <onboarding@resend.dev>', // Usando domínio padrão do Resend para teste inicial
            to: process.env.EMAIL_RECEIVER || 'render-xyz@hotmail.com',
            subject: `Novo Contato: ${name}`,
            text: `
                Novo contato recebido pelo site:
                
                Nome: ${name}
                E-mail: ${email}
                Telefone: ${phone || 'Não informado'}
                
                Mensagem:
                ${message}
            `,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #000; text-transform: uppercase; font-weight: 900;">Novo Contato Recebido</h2>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Nome:</strong> ${name}</p>
                    <p><strong>E-mail:</strong> ${email}</p>
                    <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
                    <div style="margin-top: 20px; padding: 20px; background: #F2F2F2; border-radius: 15px;">
                        <strong style="font-size: 12px; color: #666; text-transform: uppercase;">Mensagem:</strong><br />
                        <p style="margin-top: 10px; line-height: 1.6;">${message.replace(/\n/g, '<br />')}</p>
                    </div>
                    <p style="margin-top: 30px; font-size: 10px; color: #888; text-align: center;">© 2026 Render XYZ - Este é um e-mail automático.</p>
                </div>
            `
        });

        if (error) {
            console.error('Erro Resend:', error);
            return res.status(500).json({ error: 'Erro ao enviar e-mail via Resend: ' + error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error('Erro ao enviar e-mail:', error);
        return res.status(500).json({ error: 'Erro ao enviar e-mail: ' + error.message });
    }
}
