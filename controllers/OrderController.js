const errorHandler = require('../shared/utils/errorHandler');
const date_condition = require('../shared/date_condition');
const orderModule = require('../models/Order');
const Order = orderModule.model;
const Route = require('../models/Route').model;
const Product = require('../models/Product');
const Courier = require('../models/Courier');
const Distributor = require('../models/Distributor');
const Client = require('../models/Client');
const ORDER_STATUSES = orderModule.STATUSES;
const ROUTE_STATUSES = require('../models/Route').STATUSES;


// token -- distributor
module["exports"].getNewOrders = async function (request, response) {
    try {
        const orders = await Order.find({
            distributor: request.distributor._id,
            status: ORDER_STATUSES.unperformed,
            route: null
        });

        response.status(200).json({ success: true, orders });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token -- client
module["exports"].getClientUnperformedOrders = async function (request, response) {
    try {
        const orders = await Order.find({ client: request.client._id, status: ORDER_STATUSES.unperformed });

        response.status(200).json({ success: true, orders });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};





async function create(client, distributor, start, body_list, response) {
    const wrong_order = await Order.findOne({
        distributor: distributor._id,
        start: date_condition.forDay(start),
        client: client._id,
        status: ORDER_STATUSES.unperformed
    });
    if (wrong_order) {
        return response.status(200).json({
            success: false,
            message: "The client can't make an order for this date and distributor"
        });
    }

    const product_ids = body_list.map(item => item.product);
    const products = await Product.find({ distributor: distributor._id, _id: { $in: product_ids } });
    if (products.length !== product_ids.length) {
        return response.status(200).json({ success: false, message: 'Some products not found' });
    }
    const list = products.map(p => {
        const count1 = body_list.find(item => item.product === p._id.toString()).count1;
        return {
            product: p._id,
            name: p.name,
            price: p.price,
            count1,
            count2: count1,
        }
    });

    const order = new Order({
        distributor: distributor._id,
        distributor_name: distributor.name,
        client: client._id,
        client_name: client.name,
        address: client.address,
        lng: client.lng,
        lat: client.lat,
        list,
        start: start, //2020-02-29T12:21:03.867Z
        status: ORDER_STATUSES.unperformed
    });
    await order.save();

    response.status(200).json({ success: true, message: 'Order created successfully', order });
}

// distributor -- token
// client
// start
// list -- array({product, count1})
module["exports"].createOrderDistributor = async function (request, response) {
    try {
        const client = await Client.findOne({ _id: request.body.client, distributors: request.distributor._id });
        if (!client) {
            return response.status(404).json({ success: false, message: 'Client not found' });
        }

        await create(client, request.distributor, request.body.start, request.body.list, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// client -- token
// distributor
// start
// list -- array({product, count1})
module["exports"].createOrderClient = async function (request, response) {
    try {
        const distributor = await Distributor.findOne({ _id: request.body.distributor });
        if (!distributor) {
            return response.status(404).json({ success: false, message: 'The distributor not found' });
        }

        if (!request.client.distributors.includes(distributor._id)) {
            return response.status(404).json({ success: false, message: 'Client did not subscribe to the distributor' });
        }

        await create(request.client, distributor, request.body.start, request.body.list, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// order
// [list -- array({product, count1})]
// [start]
module["exports"].update = async function (request, response) {
    try {
        const updated = {};
        if (request.body.start) updated.start = request.body.start;
        if (request.body.list) {
            const product_ids = request.body.list.map(item => item.product);
            const products = await Product.findMany({ distributor: request.distributor._id, _id: { $in: product_ids } });
            if (products.length !== product_ids.length) {
                return response.status(404).json({ success: false, message: 'Some products not found' });
            }
            updated.list = products.map(p => {
                const count1 = request.body.list.find(item => item.product === p._id.toString()).count1;
                return {
                    product: p._id,
                    name: p.name,
                    price: p.price,
                    count1,
                    count2: count1,
                }
            });
        }

        const order = await Order.findOneAndUpdate(
            {
                _id: request.body.order,
                distributor: request.distributor._id,
                status: ORDER_STATUSES.unperformed,
                route: null
            },
            { $set: updated },
            { new: true, runValidators: true }
        );

        const success = !!order;
        response.status(200).json({
            success,
            message: success ? 'Order updated successfully' : 'Order not found',
            order
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};




// courier -- token
// order
// list -- array({product, count2})
module["exports"].sendFinishAgreement = async function (request, response) {
    try {
        const order = await Order.findOne({
            _id: request.body.order,
            distributor: request.courier.distributor,
            status: ORDER_STATUSES.unperformed
        });
        if (!order) {
            return response.status(200).json({ success: false, message: 'Order not found' });
        }

        order.status = ORDER_STATUSES.completed_courier;
        order.list.forEach(p1 => {
            p1.count2 = request.body.list.find(p2 => p2.product.toString() === p1.product.toString()).count2;
        });
        order.end1 = Date.now();
        await order.save();


        response.status(200).json({
            success: true,
            message: 'Order finished successfully',
            order
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// client -- token
// order
module["exports"].confirmFinish = async function (request, response) {
    try {
        const order = await Order.findOne({
            _id: request.body.order,
            client: request.client._id
        });
        if (!order) {
            return response.status(200).json({ success: false, message: 'Order not found' });
        }

        order.status = ORDER_STATUSES.completed_client;
        order.end2 = Date.now();
        await order.save();


        response.status(200).json({
            success: true,
            message: 'Order finished successfully',
            order
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// client -- token
// order
module["exports"].cancelClient = async function (request, response) {
    try {
        const order = await Order.findOne({
            _id: request.body.order,
            client: request.client._id
        });
        if (!order) {
            return response.status(200).json({ success: false, message: 'Order not found' });
        }
        if (order && order.route) {
            return response.status(200).json({ success: false, message: 'The order cannot be canceled' });
        }

        order.status = ORDER_STATUSES.canceled;
        await order.save();


        response.status(200).json({
            success: true,
            message: 'Order canceled successfully',
            order
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- distributor
module["exports"].deleteById = async function (request, response) {
    try {
        const info = await Order.deleteOne({
            _id: request.params.order,
            distributor: request.distributor._id,
            status: ORDER_STATUSES.unperformed,
            route: null
        });
        const success = info.deletedCount === 1;
        response.status(200).json({
            success,
            message: success ? 'Order deleted successfully' : 'Order not found'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};