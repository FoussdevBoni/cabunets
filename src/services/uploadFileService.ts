import axios from "axios";
import { API_URL } from "../utils/api";


export interface UploadedData {
  url: string,
  fileName: string
}
export const fileService = {

  async uploadFile(file: File): Promise<UploadedData> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.file; // Retourne la réponse du serveur
    } catch (error: any) {
      console.error("Erreur lors de l'upload :", error.response?.data || error.message);
      throw error; // Remonte l'erreur pour gérer côté appelant
    }
  },

  async uploadMultipleFiles(files: File[]): Promise<UploadedData[]> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => formData.append("files", file)); // "files" côté serveur

      const response = await axios.post(`${API_URL}/files/upload-multiple`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data?.files || [];
    } catch (error: any) {
      console.error("Erreur lors de l'upload multiple :", error.response?.data || error.message);
      throw error;
    }
  }
};
