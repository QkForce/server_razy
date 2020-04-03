const Client = require('../../models/Client');
const Distributor = require('../../models/Distributor');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const errorHandler = require('../../shared/utils/errorHandler');
const tokenGenerator = require('../../shared/utils/tokenGenerator');


// distributor_id
module["exports"].getAllByDistributorId = async function (request, response) {
    try {
        const clients = await Client.find({ distributors: request.distributor_id }, { tokens: 0, distributors: 0 });
        response.status(200).json({
            success: true,
            message: 'Success getAll client',
            clients
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token -- distributor
// bin
module["exports"].isExist = async function (request, response) {
    try {
        let clients = await Client.find({ bin: request.body.bin });
        clients = clients.map(c => {
            const c1 = c.toObject();
            c1.subscribed = c.distributors.includes(request.distributor._id);
            return c1;
        });
        const success = !!clients && clients.length > 0;
        response.status(200).json({
            success,
            message: success ? 'Success' : 'The client with this BIN was not found',
            clients
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token -- client
// bin
module["exports"].getOthers = async function (request, response) {
    try {
        const clients = await Client.find({ bin: request.params.bin });
        response.status(200).json({
            success: true,
            message: 'Success',
            clients
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


// token -- client
module["exports"].getMyDistributors = async function (request, response) {
    try {
        const distributors = await Distributor.find(
            { _id: { $in: request.client.distributors } },
            { tokens: 0, password: 0, trucks_count: 0, is_main: 0 }
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

// token -- distributor,
// bin,
// address,
// name,
// phone,
// lng, lat
module["exports"].create = async function (request, response) {
    try {
        let client = new Client({
            bin: request.body.bin,
            distributors: [request.distributor._id],
            name: request.body.name,
            phone: request.body.phone,
            address: request.body.address,
            lng: request.body.lng,
            lat: request.body.lat
        });
        await client.save();

        client = client.toObject();
        delete client.tokens;
        delete client.password;
        delete client.distributors;
        response.status(201).json({
            success: true,
            message: 'Client created successfully',
            client
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token,
// name,
// phone,
// file
module["exports"].update = async function (request, response) {
    try {
        const client = await Client.findOne({ _id: request.client.id });
        if (!client) {
            return response.status(409).json({ success: false, message: 'Client not found' });
        }

        if (request.body.name) client.name = request.body.name;
        if (request.file) {
            const image = client.get('image', null, { getters: false });
            if (image) fs.unlinkSync(image);
            client.image = request.file.path;
        }
        if (request.body.phone) client.phone = request.body.phone;
        await client.save();

        response.status(200).json({
            success: true,
            message: 'Client updated successfully',
            client
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// promo
// email
// password
module["exports"].recover = async function (request, response) {
    try {
        const client = await Client.findOne({ email: request.body.promo });
        if (!client) {
            return response.status(409).json({ success: false, message: 'Client not found' });
        }
        if (client.email.includes('@')) {
            return response.status(409).json({ success: false, message: 'Client already recovered' });
        }

        const token = tokenGenerator(client._id, request.body.email, 'client');
        client.email = request.body.email;
        client.password = bcrypt.hashSync(request.body.password, 10);
        client.tokens = [{ token }];
        await client.save();


        response.status(200).json({
            success: true,
            message: 'Success',
            token
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// client
// distributor
module["exports"].subscribeDistributor = async function (request, response) {
    try {
        const client = await Client.findOne({ _id: request.body.client });
        if (!client) {
            return response.status(404).json({ success: false, message: 'Client not found' });
        }

        if (client.distributors.includes(request.distributor._id)) {
            return response.status(200).json({ success: false, message: 'Client is already subscribed' });
        }

        client.distributors.push(request.distributor._id);
        await client.save();
        response.status(200).json({ success: true, message: 'Subscribe was successful', client });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// client
// distributor
module["exports"].unsubscribeDistributor = async function (request, response) {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: request.body.client },
            { $pull: { distributors: request.distributor._id } },
            {
                new: true,
                runValidators: true,
                fields: { tokens: 0 },
            }
        );
        const success = !!client;
        response.status(success ? 200 : 404).json({
            success,
            message: success ? 'UnSubscribe was successful' : 'Client not found'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};

// token -- distributor
// client
module["exports"].deleteById = async function (request, response) {
    try {
        const client = await Client.findOneAndDelete({
            _id: response.params.client,
            distributor: request.distributor._id
        });
        const image = client.get('image', null, { getters: false });
        if (image) fs.unlinkSync(image);
        const success = !!client;
        response.status(200).json({
            success,
            message: success ? 'Client deleted successfully' : 'Client not found'
        });
    } catch (e) {
        errorHandler.hand(response, e);
    }
};





