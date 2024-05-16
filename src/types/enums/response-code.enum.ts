enum ResponseCode{

    SUCCESS = 'SU',

    VALIDATION_FAIL = 'VF',
    DUPLICATE_ID = 'DI',
    DUPLICATE_EMAIL = 'DE',

    SING_IN_FAIL = 'SF',
    CERTIFICATION_FAIL = 'CF',

    MAIL_FAIL = 'MF',
    DATABASE_ERROR = 'DBE',

    DUPLICATE_NICKNAME = 'DN',

    NOT_EXISTED_USER = "NU",
    NOT_EXISTED_BOARD = 'NB',
    AUTHORIZATION_FAILED = "AF",

    DO_NOT_HAVE_PERMISSION = "NP"
};

export default ResponseCode;