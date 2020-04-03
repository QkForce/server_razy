const Courier = require('../../models/Courier');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const errorHandler = require('../../shared/utils/errorHandler');


// token -- distributor
module["exports"].getAll = async function (request, response) {
    try {
        let couriers = await Courier.find({distributor: request.distributor._id}, {password: 0, tokens: 0});
        response.status(200).json({
            success: true,
            message: 'Success getAll couriers',
            couriers
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token,
// email,
// password
// name,
// distributor -- token
module["exports"].create = async function (request, response) {
    try {
        // Создание пользователя
        let courier = new Courier({
            email: request.body.email,
            password: bcrypt.hashSync(request.body.password, 10),
            name: request.body.name,
            phone: request.body.phone,
            distributor: request.distributor.id
        });
        await courier.save();

        courier = courier.toObject();
        delete courier.tokens;
        delete courier.password;
        response.status(200).json({
            success: true,
            message: 'Courier created successfully',
            courier
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token,
// name,
// file
module["exports"].update = async function (request, response) {
    try {
        const courier = await Courier.findOne({_id: request.courier.id});
        if (!courier) {
            return response.status(409).json({success: false, message: "Courier not found"});
        }

        if (request.body.name) courier.name = request.body.name;
        if (request.body.phone) courier.phone = request.body.phone;
        if (request.file) {
            courier.image = request.file.path;
            const image = request.courier.get('image', null, {getters: false});
            if (image) fs.unlinkSync(image);
        }
        await courier.save();

        const success = !!request.file;
        response.status(200).json({
            success,
            message: success ? 'Courier updated successfully' : "Courier updated without image",
            courier
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token,
// courier
module["exports"].deleteById = async function (request, response) {
    try {
        const courier = await Courier.findOneAndDelete({
            _id: request.params.courier,
            distributor: request.distributor._id
        });
        const image = courier.get('image', null, {getters: false});
        if (image) fs.unlinkSync(image);
        const success = !!courier;
        response.status(200).json({
            success,
            message: success ? 'Courier deleted successfully' : 'Courier not found'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};




