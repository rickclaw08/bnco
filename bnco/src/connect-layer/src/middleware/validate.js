// src/middleware/validate.js - Joi validation middleware factory
// Usage: router.post('/endpoint', validate(schema), handler)

const Joi = require('joi');

/**
 * Creates Express middleware that validates req.body against a Joi schema.
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 * @param {string} [property='body'] - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages,
      });
    }

    // Replace the property with the validated (and stripped) value
    req[property] = value;
    next();
  };
}

module.exports = validate;
