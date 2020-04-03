const errorHandler = require('../shared/utils/errorHandler');
const Distributor = require('../models/Distributor');



module["exports"].distributorsOrders = async function (request, response, next) {
    try {
        if (request.query.distributor) {
            const distributor = await Distributor.findOne({
                distributor_owner: request.distributor_owner._id,
                distributor: request.query.distributor
            });
            if (!distributor) {
                return response.status(200).json({ success: false, message: "The distributor not found" });
            }
            request.distributor_id = distributor._id;
        } else {
            const distributors = await Distributor.find({ distributor_owner: request.distributor_owner._id });
            if (distributors.length === 0) {
                return response.status(200).json({ success: false, message: "Not found any distributor" });
            }
            request.distributor_ids = distributors.map(d => d._id);
        }



        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
}







