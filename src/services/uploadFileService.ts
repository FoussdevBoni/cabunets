// src/services/uploadService.ts

import api from "../utils/api";

export const uploadService = {
  upload: async (
    file: File,
    bucket?: string,
    path?: string
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    if (bucket) formData.append("bucket", bucket);
    if (path) formData.append("path", path);

    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.url;
  },

  uploadMultiple: async (
    files: File[],
    bucket?: string,
    path?: string,
    onProgress?: (progress: {
      current: number;
      total: number;
      percent: number;
    }) => void
  ): Promise<string[]> => {
    const urls: string[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      if (bucket) formData.append("bucket", bucket);
      if (path) formData.append("path", path);

      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            onProgress({
              current: i + 1,
              total,
              percent: Math.min(
                (i / total) * 100 + percent / total,
                100
              ),
            });
          }
        },
      });

      urls.push(response.data.url);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          percent: Math.round(((i + 1) / total) * 100),
        });
      }
    }

    return urls;
  },

  uploadMultipleWithRetry: async (
    files: File[],
    bucket?: string,
    path?: string,
    maxRetries: number = 3,
    onProgress?: (progress: {
      current: number;
      total: number;
      percent: number;
    }) => void
  ): Promise<{ urls: string[]; failed: { file: File; error: string }[] }> => {
    const urls: string[] = [];
    const failed: { file: File; error: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let success = false;
      let lastError = "";

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          if (bucket) formData.append("bucket", bucket);
          if (path) formData.append("path", path);

          const response = await api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          urls.push(response.data.url);
          success = true;
          break;
        } catch (error: any) {
          lastError = error.message || "Erreur inconnue";
          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * attempt)
            );
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
          percent: Math.round(((i + 1) / files.length) * 100),
        });
      }
    }

    return { urls, failed };
  },

  delete: async (bucket: string, path: string): Promise<void> => {
    await api.delete("/upload", {
      data: { bucket, path },
    });
  },

  deleteMultiple: async (
    files: { bucket: string; path: string }[]
  ): Promise<void> => {
    await Promise.all(
      files.map((file) =>
        api.delete("/upload", {
          data: { bucket: file.bucket, path: file.path },
        })
      )
    );
  },
};