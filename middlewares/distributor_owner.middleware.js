const errorHandler = require('../shared/utils/errorHandler');
const requestValidator = require('../shared/requestValidator');




// token -- admin,
// email,
// password
// name
// ---------------
// manager_email
// manager_password
// manager_name
// trucks_count
// address
// lng, lat
module["exports"].create = async function (request, response, next) {
    try {
        //==================================== OWNER DATA VALIDATING =======================================
        const owner_response = requestValidator.requiredFields(request.body, ["email", "password", "name"])
        if (!owner_response.success) {
            return response.status(400).json(owner_response);
        }
        //==================================== MANAGER DATA VALIDATING =======================================
        const manager_response1 = requestValidator.requiredFields(
            request.body,
            ["manager_email", "manager_password", "manager_name", "trucks_count", "address", "lng", "lat"]
        );
        if (!manager_response1.success) {
            return response.status(400).json(manager_response1);
        }

        const manager_response2 = requestValidator.numberFields(request.body, ["trucks_count", "lng", "lat"]);
        if (!manager_response2.success) {
            return response.status(400).json(manager_response2);
        }



        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
};