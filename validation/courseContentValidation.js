const z = require('zod');
const express = require('express');
const app = express();

app.use(express.json());

const titleSchema = z
    .string()
    .min(1, { message: "Title is required" })
    .max(255, { message: "Title cannot exceed 255 characters" })
    .regex(/^[^{}\[\]()]+$/, "Description contains invalid characters");

const TopicSchema = z.object({
    title: titleSchema,
});

const ModuleSchema = z.object({
    title: titleSchema,
    topics: z.array(TopicSchema).nonempty("At least one topic is required"),
});

const ContentValidationSchema = z.object({
    validity: z
        .string()
        .min(1, "Validity is required")
        .max(50, "Validity cannot exceed 50 characters"),  // Set maximum length to 50 characters
    description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description cannot exceed 500 characters"),  // Set maximum length to 500 characters
    startDate: z.date(),  // Validate that the startDate is a valid Date object
    syllabusLink: z
        .string()
        .min(1, {message: "syllabusLink is required"})
        .url("Invalid syllabus link format"),
    modules: z.array(ModuleSchema).nonempty("At least one module is required"),  // Ensure modules is an array with at least one module
});

function courseContent_Validation(req, res, next) {
    try{

        const data = {
            ...req.body,
            startDate: new Date(req.body.startDate)  // Convert to Date object
        };

        const validatedCourseContent = ContentValidationSchema.parse(data)

        req.validatedCourseContent = validatedCourseContent;
        next();
    } catch(error){
        if(error instanceof z.ZodError){
            return res.status(400).json({
                message: "Invalid content",
                error: error.errors[0].message
            })
        }

        return res.status(500).json({
            message: `Internal server Error: content validation failed`
        })
    }
}

module.exports = courseContent_Validation;