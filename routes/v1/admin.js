const { Router } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const adminRouter = Router();

// import all required modules
const {signUp_validation, signIn_validation} = require('../../validation/validation');
const {adminModel, courseModel, purchaseModel} = require('../../db');
const {hash, verifyPassword} = require('../../hashing/admin');
const { authentication } = require('../../authentication/admin');
const course_validation = require('../../validation/courseInputValidation');
const { default: mongoose } = require('mongoose');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET|| "s3cret";

// admin routes
adminRouter.post('/signUp', signUp_validation, hash, async (req, res) => {

    try{
        const {firstname, lastname, email} = req.userDetails;
        const password = req.hashedPassword;

        await adminModel.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password
        })

        res.json({
            message: "You are signed Up"
        })

    } catch(error){
        console.log(`Error while signing up: ${error}`);

        res.status(500).json({
            message: `SignUp failed`
        })
        return;
    }

   
})
// Authenticate and give new token
adminRouter.post('/signIn',signIn_validation, verifyPassword, async (req, res) => {
    try{
        const foundUser = req.verifiedUser;
        
        const admin = await adminModel.findOne({
            email: foundUser.email
        })

        if(foundUser){
            const payload = {
                id: admin.id,
                timestamp: Date.now()
            }

            const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});
            
            res.json({
                token: token,
                message: 'You are signed In'
            })
        } else{
            res.status(404).json({
                message: "Admin not found"
            })
            return;
        }
    } catch(error) {
        console.log(`Error while signing in: ${error}`);

        res.status(500).json({
            message: `Error while signing In`
        })
        return;
    }
})

// middlewares
adminRouter.use(authentication);

// get all courses admin created
adminRouter.get('/courses', async (req, res) => {
    try{
        const foundCourses = await courseModel.find({
            adminId: req.id
        })

        res.json({
            message: "courses",
            courses: foundCourses
        })

    } catch(error) {
        console.log(error);
        
        res.status(500).json('Internal server error')
    }
})
// create a new course
adminRouter.post('/create-course', course_validation, async (req, res) => {
    try{
        const validatedCourse = req.validatedCourse;
        const foundAdmin = await adminModel.findOne({
            _id: req.id
        });

        if(foundAdmin){
            const course = await courseModel.create({
                title: validatedCourse.title,
                description: validatedCourse.description,
                price: validatedCourse.price,
                imageUrl: validatedCourse.imageUrl,
                adminId: foundAdmin._id
            })

            res.json({
                message: "course successfully created",
                courseId: course._id
            })

        } else{
            return res.status(404).json({
                message: "admin not found"
            })
        }
    } catch(error) {
        console.log(error);
        
        res.status(500).json('Internal server error');
    }
})
// add course content
adminRouter.post('/courses/:courseId/content', (req, res) => {

})
// remove a specific course
adminRouter.delete('/courses/:courseId', async (req, res) => {
    try{
        const foundCourse = await courseModel.findByIdAndDelete({
            adminId: req.id,
            _id: req.params.courseId
        })
        
        if(foundCourse){
            res.json({
                message: `course has been removed`,
                courses: foundCourse
            })
        } else{
            res.status(404).json({
                message: "course not found"
            })
        }

        

    } catch(error) {
        if(error instanceof mongoose.Error.CastError){
            return res.status(401).json({
                message: "Invalid CourseId"
            })
        }
        
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
})
// remove a specific course content
adminRouter.delete('/courses/:courseId/content/:contentId', (req, res) => {

})

module.exports = {
    adminRouter
}