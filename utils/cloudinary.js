import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

cloudinary.config({
  cloud_name: "convo-application",
  api_key: "467121632436499",
  api_secret: "CY728kTGd_h9iQ63ZR-0k9PIoVU",
});

export const uploadFile = async (file) => {
  return await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
    {
      folder: "/uploads/profiles/",
    },
    (error, result) => {
      if (error) {
        console.log("Uploading Stream Error: ", error);
        return error;
      }
      console.log("Result: ",result)
       resolve(result);
    },
  ).end(file)
})
};

export const deleteUploadedfile = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    console.log("Successfully Deleted File: ", response);
    return response;
  } catch (error) {
    console.log("Failed to Delete File", error);
    return error;
  }
};
