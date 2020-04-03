const errorHandler = require('../shared/utils/errorHandler');
const date_condition = require('../shared/date_condition');

const Distributor = require('../models/Distributor');
const Product = require('../models/Product');
const Courier = require('../models/Courier');
const Client = require('../models/Client');

const Route = require('../models/Route').model;
const ROUTE_STATUSES = require('../models/Route').STATUSES;

const orderModele = require('../models/Order');
const Order = orderModele.model;
const ORDER_STATUSES = orderModele.STATUSES;





//************************************ DISTRIBUTOR PRODUCTS. FOR DAY, MONTH, PERIOD ******************************************


// token -- distributor_owner
// distributor
// date_type -- query
// Enum(day, month, [start, end]) -- query
module["exports"].distributorsOrders = async function (request, response) {
    try {
        const condition = {};

        if (request.query.distributor) {
            condition.distributor = request.distributor_id;
        } else {
            condition.distributor = { $in: request.distributor_ids };
        }

        switch (request.query.date_type) {
            case 'day':
                condition.end1 = date_condition.forDay(request.query.day);
                break;
            case 'month':
                condition.end1 = date_condition.forMonth(request.query.month);
                break;
            case 'period':
                condition.end1 = date_condition.forPeriod(request.query.start, request.query.end);
                if (condition.end1.$gte >= condition.end1.$lte) {
                    return response.status(200).json({ success: false, message: "start >= end" });
                }
                break;
        }

        const orders = await Order.find(condition);

        
        response.status(200).json({ success: true, orders });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- distributor
// date_type -- query
// Enum(day, month, [start, end]) -- query
module["exports"].distributorOrders = async function (request, response) {
    try {
        const condition = { distributor: request.distributor._id };

        switch (request.query.date_type) {
            case 'day':
                condition.end1 = date_condition.forDay(request.query.day);
                break;
            case 'month':
                condition.end1 = date_condition.forMonth(request.query.month);
                break;
            case 'period':
                condition.end1 = date_condition.forPeriod(request.query.start, request.query.end);
                if (condition.end1.$gte >= condition.end1.$lte) {
                    return response.status(200).json({ success: false, message: "start >= end" });
                }
                break;
        }

        const orders = await Order.find(condition);

        response.status(200).json({ success: true, orders });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};






//************************************ CLIENT PRODUCTS. FOR DAY, MONTH, PERIOD ******************************************


async function clientOrders(request, response, distributor) {
    const condition = {
        distributor: distributor._id
    };
    switch (request.query.date_type) {
        case 'day':
            condition.end1 = date_condition.forDay(request.query.day);
            break;
        case 'month':
            condition.end1 = date_condition.forMonth(request.query.month);
            break;
        case 'period':
            condition.end1 = date_condition.forPeriod(request.query.start, request.query.end);
            if (condition.end1.$gte >= condition.end1.$lte) {
                return response.status(200).json({ success: false, message: "start >= end" });
            }
            break;
    }

    const orders = await Order.find(condition);

    response.status(200).json({ success: true, orders });
};

// token -- distributor_owner
// date_type -- query
// Enum(day, month, [start, end]) -- query
module["exports"].clientOrdersForDistributorOwner = async function (request, response) {
    try {
        const distributor = await Distributor.findOne({
            distributor: request.query.distributor,
            distributor_owner: request.distributor_owner._id
        });
        if (!distributor) {
            return response.status(200).json({ success: false, message: "The distributor not found" });
        }

        await clientOrders(request, response, distributor);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- distributor_owner
// date_type -- query
// Enum(day, month, [start, end]) -- query
module["exports"].clientOrdersForDistributor = async function (request, response) {
    try {
        await clientOrders(request, response, request.distributor);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};



//************************************ COURIER ORDERS. FOR DAY, MONTH, PERIOD ******************************************


async function courierOrdersCounts(request, response, distributor) {
    const condition = {
        distributor: distributor._id,
        status: ROUTE_STATUSES.completed
    };
    switch (request.query.date_type) {
        case 'day':
            condition.date = date_condition.forDay(request.query.day);
            break;
        case 'month':
            condition.date = date_condition.forMonth(request.query.month);
            break;
        case 'period':
            condition.date = date_condition.forPeriod(request.query.start, request.query.end);
            if (condition.date.$gte >= condition.date.$lte) {
                return response.status(200).json({ success: false, message: "start >= end" });
            }
            break;
    }
    const routes = await routes.find(condition);

    const orders_count = routes.reduce((total_count, route) => total_count + route.orders.length, 0);

    response.status(200).json({ success: true, orders_count });
}


// token -- distributor_owner
// date_type -- query
// Enum(day, month, [start, end]) -- query
module["exports"].courierOrdersForDistributorOwner = async function (request, response) {
    try {
        const distributor = await Distributor.findOne({
            distributor: request.query.distributor,
            distributor_owner: request.distributor_owner._id
        });
        if (!distributor) {
            return response.status(200).json({ success: false, message: "The distributor not found" });
        }

        await courierOrdersCounts(request, response, distributor);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- distributor
// date_type -- query
// Enum(day, month, [start, end]) -- query
module["exports"].courierOrdersForDistributor = async function (request, response) {
    try {
        await courierOrdersCounts(request, response, request.distributor);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

