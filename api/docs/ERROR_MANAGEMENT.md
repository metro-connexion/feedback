# Error Management System - Joi and Celebrate

This document explains how to use the error management system with Joi and celebrate for request validation in the Feedback API.

## Table of Contents
1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Defining Mandatory Parameters](#defining-mandatory-parameters)
4. [Using Validation in Routes](#using-validation-in-routes)
5. [Error Handling in Controllers](#error-handling-in-controllers)
6. [Error Response Format](#error-response-format)
7. [Examples](#examples)

## Overview

The error management system uses:
- **[Joi](https://joi.dev/)**: Schema validation library for JavaScript
- **[celebrate](https://github.com/arb/celebrate)**: Express middleware wrapper for Joi
- **Custom error handler**: Centralized error handling middleware

## How It Works

1. **Validation middleware** checks incoming requests against Joi schemas
2. If validation fails, **celebrate** generates an error
3. The **error handler middleware** catches the error and formats the response
4. The error is sent back to the client with appropriate status code and details

## Defining Mandatory Parameters

### Creating a Validation Schema

Create validation schemas in `/api/src/{entity}/api/validation/` directory.

#### Example: Login Validation (email + password)

```javascript
import { celebrate, Joi, Segments } from "celebrate";

const loginValidation = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
    }),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  }),
});

export { loginValidation };
```

### Validation Segments

Celebrate/Joi can validate different parts of the request:

```javascript
import { Segments } from "celebrate";

const validation = celebrate({
  // Request body (POST, PUT, PATCH)
  [Segments.BODY]: Joi.object({ ... }),
  
  // URL parameters (e.g., /users/:id)
  [Segments.PARAMS]: Joi.object({ ... }),
  
  // Query string (e.g., /users?page=1)
  [Segments.QUERY]: Joi.object({ ... }),
  
  // Request headers
  [Segments.HEADERS]: Joi.object({ ... }),
});
```

### Common Joi Validation Rules

```javascript
// String validations
Joi.string()
  .min(3)              // Minimum length
  .max(100)            // Maximum length
  .email()             // Email format
  .uri()               // URI format
  .alphanum()          // Alphanumeric only
  .required()          // Field is mandatory

// Number validations
Joi.number()
  .min(0)              // Minimum value
  .max(100)            // Maximum value
  .integer()           // Must be integer
  .positive()          // Must be positive
  .required()

// Boolean validations
Joi.boolean()
  .required()

// Date validations
Joi.date()
  .iso()               // ISO 8601 format
  .greater('now')      // Future date
  .required()

// Array validations
Joi.array()
  .items(Joi.string()) // Array of strings
  .min(1)              // Minimum items
  .max(10)             // Maximum items
  .required()

// Object validations
Joi.object({
  name: Joi.string().required(),
  age: Joi.number().optional(),
})

// Conditional validation
Joi.alternatives().conditional('fieldName', {
  is: 'value',
  then: Joi.string().required(),
  otherwise: Joi.string().optional(),
})
```

### Custom Error Messages

Customize error messages for better user experience:

```javascript
Joi.string()
  .required()
  .messages({
    'string.base': 'Field must be a string',
    'string.empty': 'Field cannot be empty',
    'any.required': 'Field is required',
    'string.min': 'Field must be at least {#limit} characters',
    'string.max': 'Field must be at most {#limit} characters',
  })
```

## Using Validation in Routes

Apply validation middleware to routes before the controller:

```javascript
import express from "express";
import { exampleLoginController } from "../controllers/example-login-controller.js";
import { loginValidation } from "../validation/login-validation.js";

const router = express.Router();

// Validation middleware is placed before the controller
router.post("/api/example/login", loginValidation, exampleLoginController);

export default router;
```

## Error Handling in Controllers

Use `next(error)` to pass errors to the error handler:

```javascript
function myController(req, res, next) {
  try {
    // Your business logic here
    
    // Example: Custom error with status code
    if (someCondition) {
      const error = new Error("Custom error message");
      error.statusCode = 400; // Or 401, 403, 404, etc.
      return next(error);
    }
    
    // Success response
    return res.status(200).json({ message: "Success" });
    
  } catch (error) {
    // Pass unexpected errors to error handler
    return next(error);
  }
}
```

### Custom Error Example

```javascript
function loginController(req, res, next) {
  try {
    const { email, password } = req.body; // Already validated by celebrate
    
    // Check credentials (simplified example)
    const user = findUserByEmail(email);
    
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    
    if (!verifyPassword(password, user.passwordHash)) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      return next(error);
    }
    
    // Success
    return res.status(200).json({ 
      message: "Login successful",
      user: { id: user.id, email: user.email }
    });
    
  } catch (error) {
    return next(error);
  }
}
```

## Error Response Format

### Validation Error Response (400)

When validation fails:

```json
{
  "error": "Validation failed",
  "details": {
    "body": {
      "source": "body",
      "keys": ["email", "password"],
      "message": "\"email\" is required. \"password\" must be at least 8 characters long"
    }
  }
}
```

### Custom Error Response

When using `next(error)` with statusCode:

```json
{
  "error": "Invalid credentials"
}
```

### Internal Server Error (500)

For unexpected errors:

```json
{
  "error": "Internal server error"
}
```

## Examples

### Example 1: User Registration Validation

```javascript
// validation/user-registration-validation.js
import { celebrate, Joi, Segments } from "celebrate";

const userRegistrationValidation = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords must match',
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    age: Joi.number().min(18).max(120).optional(),
  }),
});

export { userRegistrationValidation };
```

### Example 2: Update Profile Validation

```javascript
// validation/update-profile-validation.js
import { celebrate, Joi, Segments } from "celebrate";

const updateProfileValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
  [Segments.BODY]: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    bio: Joi.string().max(500).optional(),
  }).min(1), // At least one field must be provided
});

export { updateProfileValidation };
```

### Example 3: Query Parameter Validation

```javascript
// validation/list-users-validation.js
import { celebrate, Joi, Segments } from "celebrate";

const listUsersValidation = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sortBy: Joi.string().valid('name', 'email', 'createdAt').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
});

export { listUsersValidation };
```

### Example 4: Complex Nested Object Validation

```javascript
// validation/create-feedback-validation.js
import { celebrate, Joi, Segments } from "celebrate";

const createFeedbackValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    category: Joi.string()
      .valid('bug', 'feature', 'improvement', 'question')
      .required(),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'critical')
      .default('medium'),
    tags: Joi.array()
      .items(Joi.string().min(2).max(30))
      .min(1)
      .max(5)
      .optional(),
    metadata: Joi.object({
      browser: Joi.string().optional(),
      os: Joi.string().optional(),
      version: Joi.string().optional(),
    }).optional(),
  }),
});

export { createFeedbackValidation };
```

### Example 5: Using Validation in a Route

```javascript
// routes/user-route.js
import express from "express";
import { loginController } from "../controllers/login-controller.js";
import { registerController } from "../controllers/register-controller.js";
import { loginValidation } from "../validation/login-validation.js";
import { userRegistrationValidation } from "../validation/user-registration-validation.js";

const router = express.Router();

// Apply validation before controller
router.post("/api/auth/login", loginValidation, loginController);
router.post("/api/auth/register", userRegistrationValidation, registerController);

export default router;
```

## Best Practices

1. **Keep validation schemas separate**: Create one file per validation schema in the `validation/` directory
2. **Use descriptive names**: Name schemas after their purpose (e.g., `loginValidation`, `createUserValidation`)
3. **Provide custom messages**: Always include user-friendly error messages
4. **Validate early**: Apply validation middleware before controller logic
5. **Use `next(error)`**: Always pass errors to the error handler, never respond directly in catch blocks
6. **Set status codes**: Add `error.statusCode` to custom errors for appropriate HTTP responses
7. **Test validation**: Write tests for both valid and invalid inputs

## Testing

Example test for validation:

```javascript
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import server from '../../../server.js';

describe('POST /api/example/login', () => {
  it('should return 400 when email is missing', async () => {
    // when
    const response = await request(server)
      .post('/api/example/login')
      .send({ password: 'password123' });

    // then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should return 400 when password is too short', async () => {
    // when
    const response = await request(server)
      .post('/api/example/login')
      .send({ email: 'test@example.com', password: 'short' });

    // then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should return 200 when credentials are valid', async () => {
    // when
    const response = await request(server)
      .post('/api/example/login')
      .send({ email: 'test@example.com', password: 'password123' });

    // then
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
  });
});
```

## References

- [Joi Documentation](https://joi.dev/api/)
- [Celebrate GitHub](https://github.com/arb/celebrate)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
