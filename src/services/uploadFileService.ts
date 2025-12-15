import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../utils/firebase";

export const uploadFileService = {
    async uploadFile (file: File, folder: string): Promise<string>{
        if (!file || !folder) {
          throw new Error("File and folder are required.");
        }
      
        const storageRef = ref(storage, `${folder}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
      
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(progress)
            
            },
            (error) => {
              console.error("Error uploading file:", error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                console.error("Error getting download URL:", error);
                reject(error);
              }
            }
          );
        });
      }
}