const errorHandler = require('../shared/utils/errorHandler');
const date_condition = require('../shared/date_condition');
const Route = require('../models/Route').model;
const Order = require('../models/Order').model;
const Courier = require('../models/Courier');
const Product = require('../models/Product');
const ROUTE_STATUSES = require('../models/Route').STATUSES;




// token -- distributor
// date -- query
module["exports"].getNewRoutes = async function (request, response) {
    try {
        const routes = await Route.find({
            distributor: request.distributor._id,
            date: date_condition.forDay(request.query.date)
        });

        const order_promises = [];
        routes.forEach(route => {
            const promise = Order.find({ _id: { $in: route.orders } });
            order_promises.push(promise);
        });

        const orders_array = await Promise.all(order_promises);
        const result = [];
        for (let i = 0; i < routes.length; i++) {
            const orders = routes[i].orders.map(orderId => orders_array[i].find(o => o._id.toString() === orderId.toString()));
            result.push({ route: routes[i], orders });
        }
        response.status(200).json({
            success: true,
            message: 'Route created successfully',
            routes_orders: result,
            trucks_count: request.distributor.trucks_count
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// courier -- token
module["exports"].getCourierRoute = async function (request, response) {
    try {
        const route = await Route.findOne({
            courier: request.courier._id,
            date: date_condition.forDay(Date.now()),
            status: ROUTE_STATUSES.active
        });
        if (!route) {
            return response.status(200).json({ success: false, message: "The route not found" });
        }
        const orders = await Order.find({ route: route._id });

        const orders_s = [];
        route.orders.forEach(o_id => {
            const order = orders.find(o => o._id.toString() === o_id.toString());
            orders_s.push(order);
        });

        response.status(200).json({ success: true, route, orders: orders_s });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token -- distributor,
// date
// orders_array -- [[123, 124], [456, 457, 458], ...]
module["exports"].createMany = async function (request, response) {
    try {
        const find_orders_promises = [];
        request.body["orders_array"].forEach(orders_ids => {
            const promise = Order.find({ _id: { $in: orders_ids }, route: null });
            find_orders_promises.push(promise);
        });
        let orders_array = await Promise.all(find_orders_promises);


        for (let i = 0; i < orders_array.length; i++) {
            if (orders_array[i].length !== request.body["orders_array"][i].length) {
                return response.status(200).json({ success: false, message: 'Some orders not found' });
            }
        }
        

        const routes_data = [];
        for (let i = 0; i < request.body["orders_array"].length; i++) {
            routes_data.push({
                distributor: request.distributor._id,
                orders: request.body["orders_array"][i],
                date: request.body.date,
                status: ROUTE_STATUSES.created
            });
        }
        const routes = await Route.insertMany(routes_data);


        const save_all_orders_promises = [];
        orders_array.forEach((orders, index) => orders.forEach(order => {
            order.route = routes[index]._id;
            save_all_orders_promises.push(order.save())
        }));
        orders_array = await Promise.all(save_all_orders_promises);


        const routes_orders = [];
        for (let i = 0; i < routes.length; i++) {
            const orders = orders_array.filter(o => request.body["orders_array"][i].includes(o._id.toString()));
            routes_orders.push({ route: routes[i], orders });
        }
        
        response.status(200).json({ success: true, message: 'Route created successfully', routes_orders });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- distributor
// route -- params
// inventory -- [{product, count1, count2}]
// courier
module["exports"].activate = async function (request, response) {
    try {
        const product_ids = request.body.inventory.map(item => item.product);
        const products = await Product.find({ distributor: request.distributor._id, _id: { $in: product_ids } });

        if (product_ids.length !== products.length) {
            return response.status(200).json({ success: false, message: 'Some Products not found' });
        }

        const inventory = products.map(p => {
            const p1 = request.body.inventory.find(p1 => p1.product === p._id.toString());
            return {
                product: p._id,
                name: p.name,
                price: p.price,
                count1: p1.count1,
                count2: p1.count2
            }
        });

        const courier = await Courier.findOne({ _id: request.body.courier, distributor: request.distributor._id });
        if (!courier) {
            return response.status(200).json({ success: false, message: 'Courier not found' });
        }


        const route = await Route.findOne({
            _id: request.params.route,
            distributor: request.distributor._id
        });
        if (!route) {
            return response.status(200).json({ success: false, message: 'Route not found' });
        }

        const routes = await Route.find({ date: route.date });
        if (routes.map(r => r.courier).includes(courier._id)) {
            return response.status(200).json({ success: false, message: 'The courier already have an order' });
        }

        route.courier = courier._id;
        route.courier_name = courier.name;
        route.inventory = inventory;
        route.status = ROUTE_STATUSES.active;
        await route.save();


        response.status(200).json({
            success: true,
            message: 'Route activated successfully',
            route
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token -- distributor
// route -- params
// inventory -- [{product, count3}]
module["exports"].finish = async function (request, response) {
    try {
        const route = await Route.findOne({ _id: request.params.route, distributor: request.distributor._id });
        if (!route) {
            return response.status(200).json({ success: false, message: 'Route not found' });
        }

        const product_ids = request.body.inventory.map(item => item.product);
        if (product_ids.length !== route.inventory.length) {
            return response.status(200).json({ success: false, message: 'Some Products not found' });
        }
        route.inventory = route.inventory.forEach(p => {
            p.count3 = request.body.inventory.find(p1 => p1.product === p.product.toString()).count3;
        });
        route.status = ROUTE_STATUSES.completed;
        await route.save();


        const success = !!route;
        response.status(200).json({
            success,
            message: success ? 'Route finished successfully' : 'Route not found',
            route
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token,
// date
module["exports"].deleteByDate = async function (request, response) {
    try {
        const routes = await Route.find({
            distributor: request.distributor._id,
            date: date_condition.forDay(request.params.date)
        });
        const route_ids = routes.map(r => r._id);

        // recovering orders
        const update_orders_info = await Order.updateMany(
            {
                distributor: request.distributor._id,
                route: { $in: route_ids }
            },
            { $set: { route: null } },
            { new: true, runValidators: true }
        );
        

        // deleting routes for the date
        const delete_routes_info = await Route.deleteMany({ distributor: request.distributor._id, _id: { $in: route_ids } });
        const success = delete_routes_info.nModified === delete_routes_info.n;
        response.status(200).json({
            success,
            message: success ? 'Route deleted successfully' : 'Some route not found',
            delete_routes_info
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};