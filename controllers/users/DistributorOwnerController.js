const DistributorOwner = require('../../models/DistributorOwner');
const Distributor = require('../../models/Distributor');
const Route = require('../../models/Route');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const bcrypt = require('bcryptjs');
const errorHandler = require('../../shared/utils/errorHandler');

// token -- admin
module["exports"].getAll = async function (request, response) {
    try {
        // Создание пользователя
        const distributor_owners = new DistributorOwner({}, {tokens: 0, password: 0});

        response.status(200).json({
            success: true,
            message: 'Success',
            distributor_owners
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


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
module["exports"].create = async function (request, response) {
    try {
        // Создание пользователя
        const distributor_owner = new DistributorOwner({
            email: request.body.email,
            password: bcrypt.hashSync(request.body.password, 10),
            name: request.body.name,
            is_main: false
        });
        await distributor_owner.save();


        const distributor = new Distributor({
            distributor_owner: distributor_owner["_id"],
            email: request.body["manager_email"],
            password: bcrypt.hashSync(request.body["manager_password"], 10),
            name: request.body["manager_name"],
            trucks_count: request.body.trucks_count,
            address: request.body.address,
            lng: request.body.lng,
            lat: request.body.lat,
        });
        await distributor.save();


        response.status(201).json({
            success: true,
            message: 'Distributor Owner created successfully',
            distributor_owner,
            distributor
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- distributor_owner,
// name,
module["exports"].update = async function (request, response) {
    try {
        const distributor_owner = await DistributorOwner.findOne({_id: request.distributor_owner._id});
        if (!distributor_owner) {
            return response.status(409).json({success: false, message: 'Distributor Owner not found'});
        }


        if (request.body.name) distributor.name = request.body.name;
        await distributor_owner.save();


        response.status(200).json({
            success: true,
            message: 'Distributor Owner updated successfully',
            distributor_owner
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- distributor_owner,
// distributor_owner -- params
module["exports"].deleteById = async function (request, response) {
    try {
        const distributor_owner = await DistributorOwner.findOneAndDelete({_id: request.params.distributor_owner});
        if (!distributor_owner) {
            return response.status(200).json({success: false, message: 'Distributor Owner not found'});
        }

        const distributors = await Distributor.find({distributor_owner: distributor_owner._id});
        const distributor_ids = distributors.map(d => d._id);

        await Distributor.deleteMany({_id: {$in: distributor_ids}});
        await Route.deleteMany({distributor: {$in: distributor_ids}});
        await Order.deleteMany({distributor: {$in: distributor_ids}});
        await Product.deleteMany({distributor: {$in: distributor_ids}});


        response.status(200).json({
            success: true,
            message: 'Distributor Owner deleted successfully'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};