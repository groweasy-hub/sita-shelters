import { v2 as cloudinary } from "cloudinary";

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../config.js";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export function isCloudinaryConfigured() {
  return Boolean(
    CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET,
  );
}

/**
 * Uploads an in-memory image buffer (from multer's memory storage — nothing
 * touches this server's disk) to Cloudinary and returns its durable URL and
 * public id. A fixed `publicId` (e.g. a user id) means a later upload
 * overwrites the same asset in place rather than accumulating orphans.
 */
export function uploadImageBuffer(buffer, { folder, publicId }) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, overwrite: true, resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export function deleteImage(publicId) {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
