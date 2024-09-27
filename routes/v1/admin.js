const { Router } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const adminRouter = Router();

// import all required modules
const {signUp_validation, signIn_validation} = require('../../validation/validation');
const {adminModel, courseModel, courseContentModel} = require('../../db');
const {hash, verifyPassword} = require('../../hashing/admin');
const { authentication } = require('../../authentication/admin');
const course_validation = require('../../validation/courseInputValidation');
const { default: mongoose } = require('mongoose');
const courseContent_Validation = require('../../validation/courseContentValidation');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET|| "s3cret";

// admin routes
adminRouter.post('/signUp', signUp_validation, hash, async (req, res) => {

    try{
        const {firstname, lastname, email} = req.userDetails;
        const password = req.hashedPassword;

        // check if admin already present in database
        const foundUser = await userModel.findOne({
            email
        })
        if(foundUser) return res.status(400).json({
            message: "User Already Exists"
        })

        // insert data if admin is not present in database
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
            message: `Signin failed`
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
        
        res.status(500).json('Internal server error: failed to retrive the course')
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
        
        res.status(500).json('Internal server error: failed to create the course');
    }
})

// update courses
adminRouter.put('/courses/:courseId', course_validation,  async (req, res) => {
    const courseDetails = req.validatedCourse;
    try{
        const foundCourse = await courseModel.updateOne({
            adminId: req.id,
            _id: req.params.courseId
        }, {
            title: courseDetails.title,
            description: courseDetails.description,
            price: courseDetails.price,
            imageUrl: courseDetails.imageUrl
        })
        
        if(foundCourse){
            res.json({
                message: `course has been updated`,
                courses: foundCourse._id
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
            message: 'Internal Server Error: failed to update the course'
        })
    }
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
            message: 'Internal Server Error: failed to remove the course'
        })
    }
})

// add course content
adminRouter.post('/courses/:courseId/content', courseContent_Validation,  async (req, res) => {
    try{
        const validatedCourseContent = req.validatedCourseContent;
        const foundCourse = await courseModel.findOne({
            adminId: req.id,
            _id: req.params.courseId
        })

        if(foundCourse) {
            const content = await courseContentModel.create({
                courseId: foundCourse._id,
                validity: validatedCourseContent.validity,
                description: validatedCourseContent.description,
                startDate: validatedCourseContent.startDate,
                syllabusLink: validatedCourseContent.syllabusLink,
                modules: validatedCourseContent.modules
            })

            await courseModel.updateOne({
                _id: req.params.courseId
            },{
                contentId: content._id
            })

            res.json({
                message: "Successfully created the content"
            })

        } else{
            return res.status(404).json({
                message: "course not found"
            })
        }

    } catch(error) {
        console.log(`details: ${error}`);
        return res.status(500).json({
            message: "Internal Server Error: failed to create course content",
        })
        
    }
});

adminRouter.get("/courses/:courseId/content", async (req, res) => {
    try{
        const foundCourse = await courseModel.findOne({
            adminId: req.id,
            _id: req.params.courseId
        })
        if(!foundCourse) return res.status(404).json({
            message: "course not found"
        })
        const foundContent = await courseContentModel.findOne({
            _id: foundCourse.contentId
        })

        if(foundContent) {
            res.json(foundContent)
        } else{
            return res.status(404).json({
                message: "content not found"
            })
        }
    } catch(error) {
        console.log(`details: ${error}`);
        return res.status(500).json({
            message: "Internal Server Error: failed to retrive course content",
        })
    }
}) 
    

adminRouter.put("/courses/:courseId/content", (req, res) => {

}) 

// remove a specific course content
adminRouter.delete('/courses/:courseId/content', (req, res) => {

})


module.exports = {
    adminRouter
}