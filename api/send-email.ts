import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, message } = req.body;

    // Validar campos
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    // Configurações do transportador (Hotmail/Outlook)
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });

    try {
        const mailOptions = {
            from: `"Contato Render XYZ" <${process.env.EMAIL_USER}>`,
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
                    <h2 style="color: #000;">Novo Contato Recebido</h2>
                    <p><strong>Nome:</strong> ${name}</p>
                    <p><strong>E-mail:</strong> ${email}</p>
                    <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
                    <div style="margin-top: 20px; padding: 15px; background: #f4f4f4; border-radius: 10px;">
                        <strong>Mensagem:</strong><br />
                        ${message.replace(/\n/g, '<br />')}
                    </div>
                    <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 10px; color: #888;">Este é um e-mail automático enviado pelo sistema Render XYZ.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Erro ao enviar e-mail:', error);
        return res.status(500).json({ error: 'Erro ao enviar e-mail: ' + error.message });
    }
}
