/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable no-console */
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

// Configuration
cloudinary.config({
  cloud_name: "dakrgonvu",
  api_key: "845531894142813",
  api_secret: "<your_api_secret>", // Click 'View API Keys' above to copy your API secret
});

// Multer file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Upload on remote cloudinary
const uploadToCloudinary = async (file: any) => {
  return new Promise((resolve, reject) => {
    // Upload an image
    cloudinary.uploader.upload(
      file.path,
      {
        public_id: file.originalname,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
