const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userAddress: {
        type: String,
        required: true,
        unique: true
    },
    nickName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
});

const userUploadsSchema = new mongoose.Schema({
    userAddress: {
        type: String,
        required: true,
        lowercase: true, // Convert to lowercase before saving
        trim: true // Optional: remove whitespace
    },
    fileName: {
        type: String,
        required: true
    },
    disease: {
        type: String,
        required: true
    },
    genMedInfoHash: {
        type: String,
        required: true
    },
    diseaseSpecialInfoHash: {
        type: String,
    },
    imagesHash: {
        type: String,
    },
    miscDataHash: {
        type: String,
    }

}, { timestamps: true });

userUploadsSchema.index({ userAddress: 1, disease: 1, genMedInfoHash: 1 }, { unique: true });

// Export the models using module.exports
module.exports = {
    User: mongoose.model('User', userSchema),
    UserUploads: mongoose.model('UserUploads', userUploadsSchema),
};
