// services/uploadService.ts
import { supabase } from "../config/supabase";
import { Readable } from "stream";

interface UploadOptions {
  bucket?: string;
  path?: string;
  file: Express.Multer.File;
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void;
}

interface UploadMultipleOptions {
  bucket?: string;
  path?: string;
  files: Express.Multer.File[];
  onProgress?: (progress: { current: number; total: number; percent: number }) => void;
}

class UploadService {
  private readonly DEFAULT_BUCKET = "uploads";
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  async upload({ bucket = this.DEFAULT_BUCKET, path = "general", file, onProgress }: UploadOptions): Promise<string> {
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

    // Upload avec progression
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        cacheControl: "3600",
        contentType: mimeType,
        upsert: true
      });

    // Simuler la progression (car Supabase ne supporte pas nativement le progress)
    if (onProgress) {
      this.simulateProgress(file.size, onProgress);
    }

    const { error } = await uploadPromise;

    if (error) throw new Error(`Upload échoué: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  // Upload multiple avec progression
  async uploadMultiple({ bucket = this.DEFAULT_BUCKET, path = "general", files, onProgress }: UploadMultipleOptions): Promise<string[]> {
    const results: string[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const url = await this.upload({
        bucket,
        path: path || `users/${file.fieldname}`,
        file,
        onProgress: (progress) => {
          if (onProgress) {
            const current = i + (progress.loaded / progress.total);
            onProgress({
              current: Math.min(current, i + 1),
              total,
              percent: Math.min((current / total) * 100, 100)
            });
          }
        }
      });
      
      results.push(url);
      
      // Mise à jour de la progression globale
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          percent: ((i + 1) / total) * 100
        });
      }
    }

    return results;
  }

  // Simuler la progression (car Supabase ne donne pas de progress)
  private simulateProgress(fileSize: number, onProgress: (progress: { loaded: number; total: number; percent: number }) => void): void {
    let loaded = 0;
    const total = fileSize;
    const interval = setInterval(() => {
      loaded += Math.random() * (total * 0.1); // Augmente de 10% max
      if (loaded >= total) {
        loaded = total;
        clearInterval(interval);
      }
      onProgress({
        loaded: Math.min(loaded, total),
        total,
        percent: Math.min((loaded / total) * 100, 100)
      });
    }, 100);
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.error(`Erreur suppression: ${error.message}`);
  }

  private sanitizePath(path: string): string {
    return path
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9/_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
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