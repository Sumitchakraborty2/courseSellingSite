const z = require('zod');
const express = require('express');
const app = express();

app.use(express.json());

const passwordSchema = z
  .string()
  .min(1, {message: "Password is required"})
  .min(10, { message: "Password must be at least 10 characters long" })  // Minimum length for security
  .max(128, { message: "Password cannot exceed 128 characters" })  // Upper limit to prevent denial-of-service attacks
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[\W_]/, "Password must contain at least one special character")
  .refine(password => !password.includes("password"), {
    message: "Password should not contain the word 'password'",
  })  // Avoid easily guessable passwords
  .refine(password => !/^[A-Za-z0-9]*$/.test(password), {
    message: "Password must contain a mix of letters, numbers, and special characters",
  });

// Define an email validation schema
const emailSchema = z
  .string()
  .min(1, {message: "email is required"})
  .email({ message: "Invalid email address" })  // Validate email format
  .max(320, { message: "Email address too long" });  // Upper limit to avoid potential exploits

// Name validation schema
const nameSchema = z
  .string()
  .min(1, {message: "Name is required"})
  .min(2, { message: "Name must be at least 2 characters long" })  // Minimum name length
  .max(100, { message: "Name must be at most 100 characters long" })  // Upper limit to prevent excessive input
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"); 

// Combine into a schema for email and password
const signUpSchema = z.object({
    firstname: nameSchema,
    lastname: nameSchema,
    email: emailSchema,
    password: passwordSchema,
});

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

function signUp_validation(req, res, next) {
    const {firstname, lastname, email, password} = req.body // simpler way to get data 
    // const firstname = req.body.firstname;
    // const lastname = req.body.lastname;
    // const email = req.body.email;
    // const password = req.body.password;
    try{
      const validation = signUpSchema.parse({
        firstname,
        lastname,
        email,
        password
      })

      req.userDetails = validation
      next();

    } catch(error) {
      if(error instanceof z.ZodError) {
        res.status(400).json({
            message: "validation failed",
            error: error.errors[0].message
        })
        return;
      }

      return res.status(500).json({
        message: `Internal server error`
      })

    }
    
}

function signIn_validation(req, res, next) {
    try{
      const email = req.body.email;
      const password = req.body.password;
      
      const validation = signInSchema.safeParse({
        email,
        password
      });     
      
      if(validation.success){
        req.userDetails = validation.data;
        next();
      } else{
        res.status(400).json({
          message: "validation failed",
          error: validation.error.errors[0].message
        })
      }
      
    } catch(error) {
      res.status(500).json({
        message: `Internal server error`
      })

    } 
}

module.exports = {
    signUp_validation,
    signIn_validation
}