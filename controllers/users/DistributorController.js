const Distributor = require('../../models/Distributor');
const Route = require('../../models/Route');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const errorHandler = require('../../shared/utils/errorHandler');


// token -- ["admin", "distributor_owner"]
module["exports"].getAll = async function (request, response) {
    try {
        const distributors = await Distributor.find(
            {distributor_owner: request.params.distributor_owner},
            {tokens: 0, password: 0}
        );
        response.status(200).json({
            success: true,
            message: 'Success',
            distributors
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token -- admin
// distributor_owner
// email,
// password
// name
// trucks_count
// address
// lng, lat
module["exports"].create = async function (request, response) {
    try {
        // Создание пользователя
        const distributor = new Distributor({
            distributor_owner: request.body.distributor_owner,
            email: request.body.email,
            password: bcrypt.hashSync(request.body.password, 10),
            name: request.body.name,
            address: request.body.address,
            lng: request.body.lng,
            lat: request.body.lat,
            trucks_count: request.body.trucks_count
        });
        await distributor.save();
        response.status(201).json({
            success: true,
            message: 'Distributor created successfully'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token,
// [name],
// [file],
// [address, lng, lat]
module["exports"].update = async function (request, response) {
    try {
        const distributor = await Distributor.findOne({_id: request.distributor.id});
        if (!distributor) {
            return response.status(409).json({success: false, message: 'Distributor not found'});
        }


        if (request.body.name) distributor.name = request.body.name;
        if (request.body.lng && request.body.lat) {
            distributor.address = request.body.address;
            distributor.lng = request.body.lng;
            distributor.lat = request.body.lat;
        }
        if (request.file) {
            const image = distributor.get('image', null, {getters: false});
            if (image) fs.unlinkSync(image);
            distributor.image = request.file.path;
        }
        await distributor.save();


        response.status(200).json({
            success: true,
            message: 'Distributor updated successfully',
            distributor
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token,
// distributor
module["exports"].deleteById = async function (request, response) {
    try {
        const distributor = await Distributor.findOneAndDelete({_id: request.params.distributor});
        if (!distributor) {
            return response.status(200).json({success: false, message: 'Distributor not found'});
        }
        const image = distributor.get('image', null, {getters: false});
        if (image) fs.unlinkSync(image);

        await Route.deleteMany({distributor: distributor._id});
        await Order.deleteMany({distributor: distributor._id});
        await Product.deleteMany({distributor: distributor._id});

        response.status(200).json({
            success: true,
            message: 'Distributor deleted successfully'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};









