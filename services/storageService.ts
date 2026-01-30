
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = import.meta.env.VITE_R2_ACCOUNT_ID;
const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_R2_BUCKET_NAME;

// O endpoint deve ser apenas a base, sem o nome do bucket no final
const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

const S3 = new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});

export const storageService = {
    /**
     * Upload de imagem para o Cloudflare R2
     */
    uploadImage: async (file: File, folder: string = "uploads"): Promise<string> => {
        try {
            // Gerar nome único: timestamp + aleatório + extensão original
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const extension = file.name.split('.').pop();
            const filename = `${folder}/${timestamp}-${random}.${extension}`;

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: filename,
                Body: file,
                ContentType: file.type,
            });

            await S3.send(command);

            // Retornar URL pública (assumindo que o bucket está público ou usando worker)
            // Se não tiver domínio customizado, precisa configurar no R2
            // Por enquanto, retornando a URL do r2.dev se configurada, ou construindo

            const publicUrlBase = import.meta.env.VITE_R2_PUBLIC_URL || `https://pub-${accountId}.r2.dev`;
            return `${publicUrlBase}/${filename}`;

        } catch (error) {
            console.error("Erro no upload R2:", error);
            throw new Error("Falha ao fazer upload da imagem.");
        }
    }
};
