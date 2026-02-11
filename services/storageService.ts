
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage as firebaseStorage } from "./firebase";

const accountId = import.meta.env.VITE_R2_ACCOUNT_ID;
const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_R2_BUCKET_NAME;

// S3 Client setup only if keys exist
const s3Configured = accountId && accessKeyId && secretAccessKey && bucketName;

const S3 = s3Configured
    ? new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    })
    : null;

export const storageService = {
    /**
     * Upload an image. Tries R2 first (if configured), fallbacks to Firebase.
     */
    uploadImage: async (file: File, folder: string = "uploads"): Promise<string> => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const extension = file.name.split('.').pop();
        const filename = `${folder}/${timestamp}-${random}.${extension}`;

        // Attempt R2 Upload if configured
        if (S3 && s3Configured) {
            try {
                console.log("STORAGE: Attempting R2 upload...");

                // Convert File/Blob to Uint8Array to fix 'getReader' SDK bug in Vercel/Chrome
                const arrayBuffer = await file.arrayBuffer();
                const body = new Uint8Array(arrayBuffer);

                const command = new PutObjectCommand({
                    Bucket: bucketName,
                    Key: filename,
                    Body: body,
                    ContentType: file.type,
                });

                await S3.send(command);

                const publicUrlBase = import.meta.env.VITE_R2_PUBLIC_URL || `https://pub-${accountId}.r2.dev`;
                return `${publicUrlBase}/${filename}`;
            } catch (r2Error) {
                console.error("STORAGE: R2 failed, falling back to Firebase:", r2Error);
                // Continue to Firebase fallback
            }
        }

        // Firebase Storage Fallback (Always available)
        try {
            console.log("STORAGE: Using Firebase Storage fallback...");
            const storageRef = ref(firebaseStorage, filename);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            return downloadUrl;
        } catch (fbError) {
            console.error("STORAGE: Critical failure in both R2 and Firebase:", fbError);
            throw new Error("Falha total ao salvar imagem. Verifique as configurações de armazenamento.");
        }
    }
};
