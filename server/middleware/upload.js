import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
  const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlMatch) {
    cloudinary.config({
      api_key: urlMatch[1],
      api_secret: urlMatch[2],
      cloud_name: urlMatch[3],
    });
    console.log('✅ Cloudinary configured successfully');
  } else {
    console.error('❌ Invalid CLOUDINARY_URL format');
  }
} else {
  console.error('❌ CLOUDINARY_URL not found in environment variables');
}

const upload = multer({ storage: multer.memoryStorage() });

export const uploadNid = upload.single('nidImage');
export const uploadCerts = upload.array('certificationImages', 5);

export const uploadToCloudinary = (file, folder = 'hirenest/profiles') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `home/${folder}`,
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Image uploaded:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};
