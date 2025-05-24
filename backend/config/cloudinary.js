import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "febincloudinary",
  api_key: "515631893686945",
  api_secret: "YaL-eiNQTe9NiUkVC8W54sDiQa0",
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) throw new Error("No file path provided");

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "avatars", // Add folder organization
    });

    fs.unlinkSync(localFilePath);
    return {
      public_id: response.public_id,
      url: response.secure_url,
    };
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    throw error; // Propagate error instead of returning null
  }
};

const deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) return null;

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
      invalidate: true,
    });
    console.log("Image deleted from cloudinary");
  } catch (error) {
    return error;
    console.log("delete from cloudinary failed", error);
  }
};

const deleteVideoFromCloudinary = async (public_id) => {
  try {
    if (!public_id) return null;

    //delete file from cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "video",
      invalidate: true,
    });
    console.log("delete from cloudinary");
  } catch (error) {
    return error;
    console.log("delete on cloudinary failed", error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };
