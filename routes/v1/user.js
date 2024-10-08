const {Router} = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userRouter = Router();

// Import all required modules
const {signUp_validation, signIn_validation} = require('../../validation/validation');
const {userModel,courseModel, purchaseModel, courseContentModel} = require('../../db');
const {hash, verifyPassword} = require('../../hashing/user');
const { authentication } = require('../../authentication/user');
const { default: mongoose } = require('mongoose');

const JWT_SECRET = process.env.USER_JWT_SECRET || "s3crect"

// Authentication Routes
// Register a new user
userRouter.post('/signUp', signUp_validation, hash, async (req, res) => {
    try{
        const {firstname, lastname, email} = req.userDetails
        const password = req.hashedPassword;

        // check if user already present in database
        const foundUser = await userModel.findOne({
            email
        })
        if(foundUser) return res.status(400).json({
            message: "User Already Exists"
        })

        // insert the data if user is not present in database
        await userModel.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password
        })

        res.json({
            message: "You are signed Up"
        })

    } catch(err) {
        // Handle any error that may occur
        console.error(`Error while pushing data into database: ${err}`);
        res.status(500).json({
            message: `signUp Failed`
        });
    }

})
// Authenticate and give new token
userRouter.post('/signIn', signIn_validation, verifyPassword, async (req, res) => {
    try{
        const foundUser = req.verifiedUser;
        
        const user = await userModel.findOne({
            email: foundUser.email
        })

        if(foundUser){
            const payload = {
                id: user.id,
                timestamp: Date.now()
            }

            const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});

            res.json({
                token: token,
                message: "You are signed In"
            })

        } else{
            res.status(404).json({
                message: "User not found"
            })
        }


    } catch(err) {
        // Handle any error that may occur
        console.error(`Error while checking credentials in database: ${err}`);
        res.status(500).json({
            message: "signin failed"
        });
    }

})

// middleware in use
userRouter.use(authentication);

// lets user logout and clears the token or session management
userRouter.post('/logOut', (req, res) => {
    res.json({
        message: "You are logged Out"
    })
})

// users routes
// retrive the courses user purchased
userRouter.get('/courses', async (req, res) => {
    try{
        const purchases = await purchaseModel.find({
            userId: req.id
        })
        if(!purchases) return res.status(404).json({
            message: "There are no purchases"
        })
        // By using promise.all you are ensuring that the promises are resolved before you try to access the results
        const courses = await Promise.all(
            purchases.map(async (purchase) => {{
                return await courseModel.findById(purchase.courseId);
            }})
        ) 
        if(courses == []) {
            return res.json({
                message: "There are no courses"
            })
        }
        res.json({
            message: "Your courses",
            courses: courses
        })
    } catch(error) {
        console.log(error);
        
        res.status(500).json({
            message: "Internal Server Error: failed to retrive the course"
        })
    }

})
// purchase a specific course
userRouter.post('/courses/:courseId/purchase', async (req, res) => {

    const courseId = req.params.courseId;
    if(!courseId) return res.status(400).json({
        message: "courseId required",
        usage: "/api.../courses/courseId/purchase"
    })

    try{
        const foundCourse = await courseModel.findById(courseId);

        if(foundCourse) {
            await purchaseModel.create({
                courseId: foundCourse._id,
                userId: req.id
            })

            res.json({
                message: `You purchased ${foundCourse.title}`
            })

        } else{
            return res.status(404).json({
                message: "course not found"
            })
        }

    } catch(error) {        
        if(error instanceof mongoose.Error.CastError){
            return res.status(401).json({
                message: `Invalid courseId`
            })
        }
        
        return res.status(500).json({
            message: "Internal Server Error: purchase failed"
        })
    }
})

userRouter.get('/courses/:courseId/content', async(req, res) => {
    try{

        // find purchases
        const foundPurchase = await purchaseModel.findOne({
            userId: req.id,
            courseId: req.params.courseId
        })

        if(!foundPurchase) return res.status(404).json({
            message: "There is no purchase"
        })

        const foundContent = await courseContentModel.findOne({
            courseId: foundPurchase.courseId
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


module.exports = {
    userRouter
}