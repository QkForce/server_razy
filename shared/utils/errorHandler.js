

module["exports"].hand = function (response, error, code = 500) {
    console.log(error);
    response.status(code).json({
        success: false,
        message: error.message ? `Что-то пошло не так. ${error.message}` : `Что-то пошло не так. ${error}`
    });
};