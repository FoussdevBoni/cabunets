import { uploadFileService } from "../services/uploadFileService";

export const uploadFiles = async (initialImages: string[] , imagesFiles: File[])=>{
   let finalImages = initialImages || [];
        
        // Upload des nouvelles images
        if (imagesFiles.length > 0) {
          const uploadedUrls = await Promise.all(
            imagesFiles.map(async (file) => {
              const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
              const url = await uploadFileService.uploadFile(
                file,
                `images/products/${filename}`
              );
              return url;
            })
          );
          
          finalImages = [...finalImages, ...uploadedUrls];
        }
return finalImages
}