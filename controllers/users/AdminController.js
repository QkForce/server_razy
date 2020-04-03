const Admin = require('../../models/DistributorOwner');
const bcrypt = require('bcryptjs');
const keys = require('../../config/keys');
const errorHandler = require('../../shared/utils/errorHandler');


// MainAdmin
module["exports"].getAll = async function (request, response) {
    try {
        const admins = await Admin.find({is_main: true}, {tokens: 0, password: 0});
        response.status(200).json({
            success: true,
            message: 'Success getAll admin',
            admins
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

//
module["exports"].create = async function (request, response) {
    try {
        if (keys.donut !== request.body.donut) {
            // Ключи не совпадает
            response.status(200).json({
                success: true,
                message: 'Identification Data is not correct',
            });
        }

        // Создание пользователя
        const admin = new Admin({
            email: request.body.email,
            password: bcrypt.hashSync(request.body.password, 10),
            name: request.body.name,
            is_main: true
        });
        await admin.save();
        response.status(201).json({
            success: true,
            message: 'Admin created successfully'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- admin
// name,
module["exports"].update = async function (request, response) {
    try {
        const admin = await Admin.findOne({_id: request.admin.id, is_main: true});
        if (!admin) {
            return response.status(409).json({success: false, message: 'Admin not found'});
        }

        if (request.name) admin.name = request.body.name;
        await admin.save();

        response.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            admin
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token
module["exports"].delete = async function (request, response) {
    try {
        const admin = await Admin.findOneAndDelete({_id: request.admin.id, is_main: true});
        const success = !!admin;
        response.status(200).json({
            success,
            message: success ? 'Admin deleted successfully' : 'Admin not found'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};







