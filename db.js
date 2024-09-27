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
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminModel"
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseContentModel"
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

const contentSchema = new schema({
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: "courseModel",
        required: true
    },
    validity: {
        type: "string",
        required: true
    },
    description: {
        type: "string",
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    syllabusLink: {
        type: "String",
        required: true
    },
    modules: [{
        title: {
            type:"string",
            required: true
        },
        topics: [{
            title:{
                type: "string",
            }
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})



const userModel = mongoose.model('user', userSchema);
const adminModel = mongoose.model('admin', adminSchema);
const courseModel = mongoose.model('course', coursesSchema);
const purchaseModel = mongoose.model('purchase', purchaseSchema);
const courseContentModel = mongoose.model('content',contentSchema);


module.exports = {
    userModel,
    adminModel,
    courseModel,
    purchaseModel,
    courseContentModel
}