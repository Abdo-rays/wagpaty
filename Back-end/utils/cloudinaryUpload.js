const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, folder = 'restaurant-app') => {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      return reject(new Error('ملف الصورة فارغ أو غير صالح'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error instanceof Error ? error : new Error(error?.message || JSON.stringify(error)));
        if (!result?.secure_url) return reject(new Error('Cloudinary لم يُرجع رابط الصورة'));
        resolve(result);
      }
    );
    uploadStream.on('error', reject);
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;