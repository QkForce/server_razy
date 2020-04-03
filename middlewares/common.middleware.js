const errorHandler = require('../shared/utils/errorHandler');


module["exports"].requiredKeys = function (keys) {
    return function(request, response, next) {
        let message = '';
        keys.forEach(key => {
            if(!request.body[key]) {
                message += key + ' is required field. '
            }
        });

        if(message !== '') {
            response.status(409).json({ success: false, message });
            return;
        }

        next();
    }
};