const errorHandler = require('../../shared/utils/errorHandler');
const tools = require('../../shared/tools');

const orderModule = require('../../models/Order');
const Order = orderModule.model;
const Route = require('../../models/Route').model;
const Product = require('../../models/Product');
const Distributor = require('../../models/Distributor');
const Courier = require('../../models/Courier');
const Client = require('../../models/Client');
const ORDER_STATUSES = orderModule.STATUSES;
const ROUTE_STATUSES = require('../../models/Route').STATUSES;








function separateOrdersToOrdersArray(routes_count, orders) {
    orders_array = [];
    for (let i = 0; i < routes_count; i++) {
        orders_array.push([]);
    }
    for (let i = 0, r = 0; i < orders.length; i++, r++) {
        if (routes_count === r) r = 0;
        orders_array[r].push(orders[i]);
    }

    return orders_array;
}


function makeOrdersData(clients, distributor, products, start, status) {
    const orders = [];
    clients.forEach(client => {
        const list = [];

        const products_part = tools.randItemsFromArray(products);
        products_part.forEach(p => {
            list.push({
                product: p._id,
                name: p.name,
                price: p.price,
                count1: tools.rand(1, 15),
                count2: tools.rand(1, 15),
            });
        });

        orders.push({
            distributor: distributor._id,
            distributor_name: distributor.name + " (fake)",
            client: client._id,
            client_name: client.name,
            address: client.address,
            lng: client.lng,
            lat: client.lat,
            list,
            start, //2020-02-29T12:21:03.867Z
            status
        });
    });


    return orders;
}


function makeRoutesData(distributor, orders, couriers, date, status) {
    let routes_count = distributor.trucks_count > orders.length ? 1 : tools.rand(1, distributor.trucks_count);
    if (routes_count > couriers.length) {
        routes_count = 1;
    }

    const orders_array = separateOrdersToOrdersArray(routes_count, orders);

    const routesData = [];
    for (let i = 0; i < routes_count; i++) {
        routesData.push({
            distributor: distributor._id,
            orders: orders_array[i].map(o => o._id),
            date,
            courier: couriers[i]._id,
            courier_name: couriers[i].name + " (fake)",
            status
        });
    }

    return { routesData, orders_array };
}


// token -- admin
// distributor
// order_start
// route_date
module["exports"].generateFinishedRoutes = async function (request, response) {
    try {
        const distributor = await Distributor.findOne({ _id: request.body.distributor });
        if (!distributor) {
            return response.status(200).json({ success: false, message: "The distributor not found" });
        }
        const products = await Product.find({ distributor: distributor._id });
        if (products.length === 0) {
            return response.status(200).json({ success: false, message: "products.length === 0" });
        }
        const clients = await Client.find({ distributors: distributor._id });
        if (clients.length === 0) {
            return response.status(200).json({ success: false, message: "clients.length === 0" });
        }
        const couriers = await Courier.find({ distributor: distributor._id });
        if (couriers.length === 0) {
            return response.status(200).json({ success: false, message: "couriers.length === 0" });
        }



        const ordersData = makeOrdersData(clients, distributor, products, request.body.order_start, ORDER_STATUSES.unperformed);
        const orders = await Order.insertMany(ordersData);



        const { routesData, orders_array } = makeRoutesData(distributor, orders, couriers, request.body.route_date, ROUTE_STATUSES.completed);

        const routes = await Route.insertMany(routesData);
        for (let i = 0; i < routesData.length; i++) {
            orders_array[i].forEach(order => {
                order.route = routes[i]._id;
                order.end1 = request.body.route_date;
                order.status = ORDER_STATUSES.completed_courier;
                order.save();
            });
        }


        response.status(200).json({
            success: true,
            distributor: distributor._id
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- admin
// distributor
// courier
// order_start
// route_date
module["exports"].createRouteWithOrders = async function (request, response) {
    try {
        const distributor = await Distributor.findOne({ _id: request.body.distributor });
        if (!distributor) {
            return response.status(200).json({ success: false, message: "The distributor not found" });
        }
        const courier = await Courier.findOne({ distributor: distributor._id, _id: request.body.courier });
        if (!courier) {
            return response.status(200).json({ success: false, message: "The courier not found" });
        }
        const products = await Product.find({ distributor: distributor._id });
        if (products.length === 0) {
            return response.status(200).json({ success: false, message: "products.length === 0" });
        }
        const clients = await Client.find({ distributors: distributor._id });
        if (clients.length === 0) {
            return response.status(200).json({ success: false, message: "clients.length === 0" });
        }

        
        const ordersData = makeOrdersData(clients, distributor, products, request.body.order_start, ORDER_STATUSES.unperformed);
        const orders = await Order.insertMany(ordersData);

        

        const route = new Route({
            distributor: distributor._id,
            orders: orders.map(o => o._id),
            date: request.body.route_date,
            courier: courier._id,
            courier_name: courier.name + " (fake)",
            status: ROUTE_STATUSES.active
        });
        await route.save();
        orders.forEach(order => {
            order.route = route._id;
            order.save();
        });

        response.status(200).json({
            success: true,
            route
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
}




// token -- admin
// route
module["exports"].deleteRouteWithOrders = async function (request, response) {
    try {
        const route = await Route.findOneAndDelete({ _id: request.body.route });
        if (!route) {
            return response.status(200).json({ success: false, message: "The route not found" });
        }

        const delete_orders_info = await Order.deleteMany({ route: route._id });

        response.status(200).json({
            success: true,
            route,
            delete_orders_info
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
}


