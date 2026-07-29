// services/uploadService.ts
import axios from 'axios';
import { API_URL } from '../utils/api';

export const uploadService = {
  upload: async (file: File, token?: string, bucket?: string, path?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    if (bucket) formData.append('bucket', bucket);
    if (path) formData.append('path', path);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.url;
  },

  uploadMultiple: async (
    files: File[], 
    token?: string, 
    bucket?: string, 
    path?: string,
    onProgress?: (progress: { current: number; total: number; percent: number }) => void
  ): Promise<string[]> => {
    const urls: string[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      if (bucket) formData.append('bucket', bucket);
      if (path) formData.append('path', path);

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress({
              current: i + 1,
              total,
              percent: Math.min(((i / total) * 100) + (percent / total), 100)
            });
          }
        }
      });
      
      urls.push(response.data.url);
      
      // Mise à jour de la progression globale
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          percent: Math.round(((i + 1) / total) * 100)
        });
      }
    }

    return urls;
  },

  uploadMultipleWithRetry: async (
    files: File[],
    token?: string,
    bucket?: string,
    path?: string,
    maxRetries: number = 3,
    onProgress?: (progress: { current: number; total: number; percent: number }) => void
  ): Promise<{ urls: string[]; failed: { file: File; error: string }[] }> => {
    const urls: string[] = [];
    const failed: { file: File; error: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let success = false;
      let lastError = '';

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          if (bucket) formData.append('bucket', bucket);
          if (path) formData.append('path', path);

          const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          
          urls.push(response.data.url);
          success = true;
          break;
        } catch (error: any) {
          lastError = error.message || 'Erreur inconnue';
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (!success) {
        failed.push({ file, error: lastError });
      }

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          percent: Math.round(((i + 1) / files.length) * 100)
        });
      }
    }

    return { urls, failed };
  },

  delete: async (bucket: string, path: string, token: string): Promise<void> => {
    await axios.delete(`${API_URL}/upload`, {
      data: { bucket, path },
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  deleteMultiple: async (files: { bucket: string; path: string }[], token: string): Promise<void> => {
    const deletePromises = files.map(async (file) => {
      await axios.delete(`${API_URL}/upload`, {
        data: { bucket: file.bucket, path: file.path },
        headers: { Authorization: `Bearer ${token}` }
      });
    });

    await Promise.all(deletePromises);
  }
};