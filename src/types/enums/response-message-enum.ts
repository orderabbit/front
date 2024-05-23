enum ResponseMessage{
    SUCCESS = "SUCCESS.",

    VALIDATION_FAIL = "Validation failed.",
    DUPLICATE_ID = "Duplicate id.",
    DUPLICATE_EMAIL = "Duplicate Email",

    SIGN_IN_FAIL = "Login information mismatch.",
    CERTIFICATION_FAIL = "Certification failed.",

    MAIL_FAIL = "Mail send failed",
    DATABASE_ERROR = "Database error.",

    DUPLICATE_NICKNAME = 'Duplicate nickname',
    NOT_EXISTED_USER = "Not Existed User",
    NOT_EXISTED_BOARD = 'Not Existed Board',
    
    WRONG_PASSWORD = "Wrong Password",
    DO_NOT_HAVE_PERMISSION = "Do Not Have Permission"
};

export default ResponseMessage;