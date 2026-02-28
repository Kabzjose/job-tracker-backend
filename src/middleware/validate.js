const Joi = require("joi")

//defining the schemas for validating user input for registration, login, and job operations using Joi. The validate function is a middleware that checks the request body against the provided schema and returns an error response if validation fails.

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).trim().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
})

const loginSchema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).required(),
})

const jobSchema = Joi.object({
    title: Joi.string().min(2).max(100).required().trim(),
    company: Joi.string().min(2).max(100).required().trim(),
    location: Joi.string().required().trim(),
    date_applied: Joi.date().required(),
    status: Joi.string().valid("Applied", "Interview", "Offer", "Rejected").required(),
})

// middleware function that validates against a schema
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false })//collect all errors
  if (error) {
    const errors = error.details.map(detail => detail.message)//extract error messages
    return res.status(400).json({ errors })
  }
  next()
}




module.exports = { validate, registerSchema, loginSchema, jobSchema }