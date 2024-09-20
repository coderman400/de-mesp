import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    userAddress: {
        type: String,
        required:true,
    },
    nickName:{
        type: String,
        required:true
    },
    genMedInfoHash: {
        type: String,
    },
    diseaseSpecialInfoHash: {
        type: String,
    },
    imagesHash: {
        type: String,
    },
    miscDataHash: {
        type:String,
    }

})

const User = mongoose.model('User', userSchema);

export default User;