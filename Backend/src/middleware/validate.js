const formatZodError = (error) =>
  error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message
  }));

export const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatZodError(error)
      });
    }
    next(error);
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: formatZodError(error)
      });
    }
    next(error);
  }
};

