module.exports = {
    app: {
        name: "Virtual Learning System", // App name
    },
    port: process.env.PORT || 3000, // Server port
    database: {
        url: process.env.MONGO_DB_URL, // MongoDB connection URL
    },
    jwt: {
        secret: process.env.JWT_SECRET, // JWT secret key
        tokenLife: "7d", // JWT token life
    },
    cloudinaryKeys: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
        api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key
        api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary API secret
    },
};
