import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: "convo-application",
  api_key: "467121632436499",
  api_secret: "CY728kTGd_h9iQ63ZR-0k9PIoVU", // Click 'View API Keys' above to copy your API secret
});


export const uploadFile = async(filePath) => {
    try {
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type:'auto'
        })
        console.log("Upload Response: ", response)
        return response
    } catch (error) {
        console.log('Upload Error: ', error)
        return error
    }
}

