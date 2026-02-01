const ERRORS = {
  TOKEN: {
    REQUIRED: new Error({ statusCode: 401, message: "Token is required" }),
    EXPIRED_TOKEN: new Error({ statusCode: 401, message: "Token has expired" }),
    INVALID_TOKEN: new Error({ statusCode: 401, message: "Token is invalid" }),
    VERIFICATION_FAILED: new Error({ statusCode: 401, message: "Token verification failed" }),
  },
};

export default ERRORS;
