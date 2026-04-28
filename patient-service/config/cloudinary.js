require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'daktz764j',
    api_key: process.env.CLOUDINARY_API_KEY || '788751635851673',
    api_secret: process.env.CLOUDINARY_API_SECRET || '3edl_Ciei54x5eEVGnyfs2_juUE'
});

// Storage Engine for Profile Images (only images permitted)
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'patient/profile-images', // Adding the 'patient' prefix to the folder
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});

// Storage Engine for Medical Reports (allows documents and images)
const reportStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'patient/medical-reports',
            // Switching to 'image' format for PDFs allows Cloudinary to generate 
            // a viewable image/preview which bypasses the PDF security block
            resource_type: 'image', 
            format: 'jpg' 
        };
    }
});

const uploadProfileImage = multer({ storage: imageStorage });
const uploadReportFile = multer({ storage: reportStorage });

module.exports = {
    cloudinary,
    uploadProfileImage,
    uploadReportFile
};
