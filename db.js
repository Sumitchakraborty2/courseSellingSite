const mongoose = require('mongoose');
const schema = mongoose.Schema;



const userSchema = new schema({
    firstname: String,
    lastname: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const adminSchema = new schema({
    firstname: String,
    lastname: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const coursesSchema = new schema({
    title: {
        type:String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number
    },
    imageUrl: {
        type: String
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminModel"
    }
})

const purchaseSchema = new schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseModel"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel"
    },

})


const userModel = mongoose.model('user', userSchema);
const adminModel = mongoose.model('admin', adminSchema);
const courseModel = mongoose.model('course', coursesSchema);
const purchaseModel = mongoose.model('purchase', purchaseSchema);


module.exports = {
    userModel,
    adminModel,
    courseModel,
    purchaseModel
}