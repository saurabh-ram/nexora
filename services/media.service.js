import multer from "multer";
// import { memoryStorage } from "multer";
import fs from "fs";
import path from "path";
import streamifier from "streamifier";
import { fileURLToPath } from "url";
import cloudinaryModule from "../config/mediahandler.js";

const __dirName = path.dirname(fileURLToPath(import.meta.url));
const currentFolder = __dirName.split(path.sep).pop();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const cloudinary = cloudinaryModule.cloudinary;

async function uploadToCloudinary(file, folderName = "posters") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: folderName,
      },
      (error, result) => {
        if (error) return reject(error);
        // console.log(result);
        return resolve(result.secure_url);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

function getPoster(file) {
  return file
    ? file.buffer
    : fs.readFileSync(
        path.join(
          __dirName.slice(0, -1 * currentFolder.length),
          "public",
          "images",
          "you_cant_see_me.jpg",
        ),
      );
}

export { getPoster, upload, uploadToCloudinary };
