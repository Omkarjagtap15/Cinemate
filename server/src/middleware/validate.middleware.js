const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Assign parsed values
    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.errors?.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })) || error.message,
    });
  }
};

module.exports = { validate };
