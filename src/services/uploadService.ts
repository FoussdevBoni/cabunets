// services/uploadService.ts
import { supabase } from "../config/supabase";

interface UploadOptions {
  bucket?: string;
  path?: string;
  file: Express.Multer.File;
}

class UploadService {
  private readonly DEFAULT_BUCKET = "uploads";
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  async upload({ bucket = this.DEFAULT_BUCKET, path = "general", file }: UploadOptions): Promise<string> {
    // Nettoyer le path (supprimer les espaces, accents, caractères spéciaux)
    const cleanPath = this.sanitizePath(path);
    
    const mimeType = file.mimetype || this.getMimeTypeFromExtension(file.originalname);
    
    if (!mimeType || !this.isAllowedType(mimeType)) {
      throw new Error(`Type non autorisé: ${mimeType || "inconnu"}`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`Fichier trop volumineux: max ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    await this.ensureBucket(bucket);

    const extension = this.getExtension(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = `${cleanPath}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        cacheControl: "3600",
        contentType: mimeType,
        upsert: true
      });

    if (error) throw new Error(`Upload échoué: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.error(`Erreur suppression: ${error.message}`);
  }

  private sanitizePath(path: string): string {
    return path
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
      .replace(/[^a-z0-9/_-]/g, "_")   // Remplace les caractères invalides par _
      .replace(/_+/g, "_")              // Supprime les _ multiples
      .replace(/^_|_$/g, "");          // Supprime les _ au début et fin
  }

  private async ensureBucket(bucketName: string): Promise<void> {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucketName);
    
    if (!exists) {
      await supabase.storage.createBucket(bucketName, { public: true });
    }
  }

  private getMimeTypeFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop() || 'bin';
  }

  private isAllowedType(mimeType: string): boolean {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    return allowed.includes(mimeType);
  }
}

export const uploadService = new UploadService();