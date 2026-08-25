const ApiError = require('../utils/apiError');


const handleCastErrorDB = (err) => {
    const message = `قيمة غير صحيحة لـ ${err.path}: ${err.value}`;
    return new ApiError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    const message = `القيمة "${value}" مستخدمة بالفعل في حقل "${field}", استخدم قيمة تانية`;

    return new ApiError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `بيانات غير صحيحة: ${errors.join('. ')}`;

    return new ApiError(message, 400);
};


const handleJWTError = () => {
    return new ApiError('توكن غير صحيح، من فضلك سجل دخول تاني', 401);
};

const handleJWTExpiredError = () => {
    return new ApiError('انتهت صلاحية الجلسة، من فضلك سجل دخول تاني', 401);
};


const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    console.error('ERROR 💥', err);

    return res.status(500).json({
        status: 'error',
        message: 'حصل خطأ ما في السيرفر، حاول تاني لاحقًا',
    });
};


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = {
            ...err,
            message: err.message,
            name: err.name,
        };

        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }

        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }

        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }

        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }

        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }

        sendErrorProd(error, res);
    }
};
