const DistributorOwner = require('../models/DistributorOwner');
const Distributor = require('../models/Distributor');
const Courier = require('../models/Courier');
const Client = require('../models/Client');

const DUPLICATE_EMAIL = {
    success: false,
    message: 'Такой email уже занят. Побробуй другой.'
};

module['exports'].isEmailExist = async function (request, response, next) {
    const distributor_owner = await DistributorOwner.findOne({email: request.body.email});
    if (distributor_owner) {
        return response.status(409).json(DUPLICATE_EMAIL);
    }

    const distributor = await Distributor.findOne({email: request.body.email});
    if (distributor) {
        return response.status(409).json(DUPLICATE_EMAIL);
    }

    const courier = await Courier.findOne({email: request.body.email});
    if (courier) {
        return response.status(409).json(DUPLICATE_EMAIL);
    }

    const client = await Client.findOne({email: request.body.email});
    if (client) {
        return response.status(409).json(DUPLICATE_EMAIL);
    }

    next();
};