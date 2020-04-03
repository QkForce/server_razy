const errorHandler = require('../shared/utils/errorHandler');
const requestValidator = require('../shared/requestValidator');


// distributor -- token
// client
// list -- array({product, count1})
// start
module["exports"].create = async function (request, response, next) {
    try {
        const check0 = requestValidator.requiredFields(request.body, ["start", "list"]);
        if (!check0.success) {
            return response.status(200).json(check0);
        }

        const check1 = requestValidator.numberList(request.body.list, "count1");
        if (check1.success === false) {
            return response.status(200).json({ success: check1.success, message: check1.message });
        }


        if (request.userType === 'distributor' && !request.body.client) {
            return response.status(200).json({
                success: false,
                message: 'client (client identification number) is required'
            });
        }
        if (request.userType === 'client' && !request.body.distributor) {
            return response.status(200).json({
                success: false,
                message: 'distributor (distributor identification number) is required'
            });
        }

        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// order
// [list] -- array({product, count1})
// [start]
// [route]
module["exports"].update = async function (request, response, next) {
    try {
        if (!request.body.order) {
            return response.status(409).json({ success: false, message: 'order_id (order) is required' });
        }

        if (request.body.list) {
            const check1 = isCorrectProductList(request.body.list, "count1");
            if (check1.success !== false) {
                return response.status(409).json({ success: check1.success, message: check1.message });
            }
        }


        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// courier -- token
// order
// list array({product, count2})
module["exports"].confirmFinish = async function (request, response, next) {
    try {
        if (!request.body.order) {
            response.status(409).json({ success: false, message: 'order_id (order) is required' });
            return;
        }

        const { success, message } = isCorrectProductList(request.body.list, "count2");
        if (success !== false) {
            return response.status(409).json({ success, message });
        }

        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// list [{product, count}]
function isCorrectProductList(body_list, countType) {
    const unique = new Set(body_list.map(item => item.product));
    if (unique.size !== body_list.length) return { success: false, message: 'list must be unique' };

    let message = '';
    body_list.forEach((item, index) => {
        if (message === '') {
            if (!item.product) message += `product is undefined or null. (at ${index}) `;
            if (isNaN(item[countType])) message += `${countType} is NaN. (at ${index}) `;
        }
    });
    if (message !== '') return { success: false, message };


    return { success: true };
}


