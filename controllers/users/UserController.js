const bcrypt = require('bcryptjs');
const Distributor = require('../../models/Distributor');
const DistributorOwner = require('../../models/DistributorOwner');
const Courier = require('../../models/Courier');
const Client = require('../../models/Client');
const errorHandler = require('../../shared/utils/errorHandler');
const tokenGenerator = require('../../shared/utils/tokenGenerator');




const USER_TYPES = {
    admin: 'admin',
    distributor_owner: 'distributor_owner',
    distributor: 'distributor',
    courier: 'courier',
    client: 'client'
};

const COLLECTIONS = new Map([
    ['admin', DistributorOwner],
    ['distributor_owner', DistributorOwner],
    ['distributor', Distributor],
    ['courier', Courier],
    ['client', Client]
]);


//************************************ CHANGE PASSWORD ******************************************
// token,
// oldPassword,
// newPassword
async function changePassword(user, userType, oldPassword, newPassword, response) {
    const passwordResult = bcrypt.compareSync(oldPassword, user.password);

    if (!passwordResult) {
        return response.status(401).json({success: false, message: 'Wrong password'});
    }

    // Генерация токена
    const token = tokenGenerator(user._id, user.email, userType);

    await COLLECTIONS.get(userType).findOneAndUpdate(
        {_id: user._id},
        {
            $set: {password: bcrypt.hashSync(newPassword, 10), tokens: [{token}]}
        },
        {
            new: true,
            fields: {password: 0, tokens: 0},
            runValidators: true
        }
    );

    response.status(200).json({
        success: true,
        message: 'Password changed successfully',
        token: `Bearer_${token}`
    });
}


module["exports"].changePasswordAdmin = async function (request, response) {
    try {
        await changePassword(
            request.admin,
            USER_TYPES.admin,
            request.body["oldPassword"],
            request.body["newPassword"],
            response
        );
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].changePasswordDistributorOwner = async function (request, response) {
    try {
        await changePassword(
            request.distributor_owner,
            USER_TYPES.distributor_owner,
            request.body["oldPassword"],
            request.body["newPassword"],
            response
        );
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].changePasswordDistributor = async function (request, response) {
    try {
        await changePassword(
            request.distributor,
            USER_TYPES.distributor,
            request.body["oldPassword"],
            request.body["newPassword"],
            response
        );
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].changePasswordCourier = async function (request, response) {
    try {
        await changePassword(
            request.courier,
            USER_TYPES.courier,
            request.body["oldPassword"],
            request.body["newPassword"],
            response
        );
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].changePasswordClient = async function (request, response) {
    try {
        await changePassword(
            request.client,
            USER_TYPES.client,
            request.body["oldPassword"],
            request.body["newPassword"],
            response
        );
    } catch (e) {
        errorHandler.hand(response, e);
    }
};



//************************************ GET PROFILE ******************************************
// token
module["exports"].getProfile = async function (request, response) {
    try {
        const user = request[request.userType];
        delete user.tokens;
        delete user.password;

        response.status(200).json({success: true, message: 'Success', [request.userType]: user});
    } catch (e) {
        errorHandler.hand(response, e);
    }
};