const z = require('zod');
const express = require('express');
const app = express();

app.use(express.json());

const titleSchema = z
    .string()
    .min(1, { message: "Title is required" })
    .max(255, { message: "Title cannot exceed 255 characters" })
    .regex(/^[^{}\[\]()]+$/, "Description contains invalid characters");

const descriptionSchema = z
    .string()
    .min(1, { message: "description is required" })
    .regex(/^[^{}\[\]()]+$/, "Description contains invalid characters");

const priceSchema = z
    .number()
    .positive({ message: "Price must be a positive number" });

const imageUrlSchema = z
    .string()
    .url({ message: "Must be a valid URL" });

const coursesValidationSchema = z.object({
    title:  titleSchema,
    description: descriptionSchema,
    price: priceSchema,
    imageUrl: imageUrlSchema
}).strict();

function course_validation(req, res, next) {
    try{
        const validatedCourse = coursesValidationSchema.parse(req.body);

        req.validatedCourse = validatedCourse;
        next();
    } catch(error) {
        if(error instanceof z.ZodError) {
            res.status(400).json({
                message: "validation failed",
                error: error.errors
            })
            return;
        }

        return res.status(500).json({
            message: `Internal server error`
        })

    }
}


module.exports = course_validation;