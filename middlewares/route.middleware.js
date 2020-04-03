const errorHandler = require('../shared/utils/errorHandler');
const Courier = require('../models/Courier');


module["exports"].createMany = async function (request, response, next) {
    try {
        if (!request.body["orders_array"]) {
            return response.status(409).json({ success: false, message: 'orders_array parameter is required' });
        }

        const all_orders = [];
        request.body["orders_array"].forEach(arr => all_orders.join(arr));
        const unique = new Set(all_orders);
        if (all_orders.length !== unique.size) {
            return response.status(409).json({ success: false, message: 'orders_array must be unique' });
        }

        if (request.body["orders_array"].length < 1) {
            return response.status(200).json({ success: false, message: 'orders_array.length <= 0' });
        }
        if (request.body["orders_array"].length > request.distributor.trucks_count) {
            return response.status(200).json({ success: false, message: 'More trucks than indicated' });
        }
        const couriers_count = await Courier.count({ distributor: request.distributor._id });
        if (request.body["orders_array"].length < couriers_count) {
            return response.status(200).json({ success: false, message: 'Routes count less than couriers count' });
        }


        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
};





// courier
// sent --
module["exports"].activate = async function (request, response, next) {
    try {
        if (!request.body.courier || !request.body.courier.match(/^[0-9a-fA-F]{24}$/)) {
            return response.status(409).json({ success: false, message: 'courier (courier identification number) is required' });
        }
        if (!request.body.inventory) {
            return response.status(409).json({ success: false, message: 'inventory (product list) is required' });
        }
        const product_ids = request.body.inventory.map(item => item.product);
        const unique = new Set(product_ids);
        if (unique.size !== request.body.inventory.length) {
            return response.status(409).json({ success: false, message: 'sent (product list) must be unique' });
        }

        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// received -- [{product, count}]
module["exports"].finish = async function (request, response, next) {
    try {
        if (!request.body.inventory) {
            return response.status(409).json({ success: false, message: 'received (product list) is required' });
        }
        const product_ids = request.body.inventory.map(item => item.product);
        const unique = new Set(product_ids);
        if (unique.size !== request.body.inventory.length) {
            return response.status(409).json({ success: false, message: 'received (product list) must be unique' });
        }

        next();
    } catch (e) {
        errorHandler.hand(response, e);
    }
};





// list [{product, count}]
function isCorrectProductList(list) {
    const unique = new Set(list.map(item => item.product));
    if (unique.size !== list.length) return { success: false, message: 'list must be unique' };

    let message = '';
    list.forEach((item, index) => {
        if (message === '') {
            if (!item.product) message += `product is undefined or null. (at ${index}) `;
            if (isNaN(item.count)) message += `count is NaN. (at ${index}) `;
        }
    });
    if (message !== '') return { success: false, message };


    return { success: true };
}
