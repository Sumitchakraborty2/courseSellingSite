const {Router} = require('express');
const courseRouter = Router();

// modules
const { courseModel, courseContentModel } = require('../../db');

// course management routes
// retrive a list of avaiable courses
courseRouter.get('/', async (req, res) => {
    try{
        const courses = await courseModel.find();

        if(courses){
            res.json({
                message: "courses",
                courses: courses
            })
        } else{
            res.status(404).json({
                message: "courses not found"
            })
        }
    } catch(error) {
        res.status(500).json({
            message: `Internal server error`
        })
    }
})
// retrive detail about a specific course
courseRouter.get('/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    try{
        const courses = await courseModel.findOne({
            _id: courseId
        });

        if(courses){
            res.json({
                message: "courses",
                courses: courses
            })
        } else{
            res.status(404).json({
                message: "Invalid course Id"
            })
        } 
    } catch(error) {
        console.log(error);
        
        res.status(500).json({
            message: `Internal server error`
        })
    }
})
// retrive the content of a specific course
courseRouter.get('/:courseId/content', async (req, res) => {
    try{
        const foundCourse = await courseModel.findOne({
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



module.exports = {
    courseRouter
}