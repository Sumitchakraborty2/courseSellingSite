const {Router} = require('express');
const courseRouter = Router();

// modules
const { courseModel } = require('../../db');

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
courseRouter.get('/:courseId/content', (req, res) => {

})


module.exports = {
    courseRouter
}