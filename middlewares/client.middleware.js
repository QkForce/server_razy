const errorHandler = require('../shared/utils/errorHandler');


module["exports"].getAllByDistributorId = async function (request, response, next) {
    try {
        if (request.userType === 'distributor') {
            request.distributor_id = request.distributor._id;
        } else {
            return response.status(400).json({ success: false, message: 'Wrong userType' });
        }


        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
}


module["exports"].create = async function (request, response, next) {
    try {
        if (request.userType === 'admin') {
            request.distributor_id = request.body.distributor;
        } else if (request.userType === 'distributor') {
            request.distributor_id = request.distributor._id;
        } else {
            return response.status(400).json({ success: false, message: 'Wrong userType' });
        }


        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
}