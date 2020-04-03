const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const DistributorOwner = mongoose.model('distributor_owners');
const Distributor = mongoose.model('distributors');
const Courier = mongoose.model('couriers');
const Client = mongoose.model('clients');
const keys = require('../config/keys');
const errorHandler = require('../shared/utils/errorHandler')

const NOT_AUTHORIZED = {
    success: false,
    message: 'Not authorized to access this resource'
};

const COLLECTIONS = new Map([
    ['admin', DistributorOwner],
    ['distributor_owner', DistributorOwner],
    ['distributor', Distributor],
    ['courier', Courier],
    ['client', Client]
]);




module["exports"].is = function(userTypes) {
    return async (request, response, next) => {
        const headerToken = request.header('Authorization');
        if(!headerToken) {
            response.status(401).json({success: false, message: "RequestHeader is without token"});
            return;
        }
        const token = request.header('Authorization').replace('Bearer_', '');
        try {
            const decoded = await jwt.verify(token, keys.jwt);
            const userType = decoded["userType"];


            if(!userTypes.includes(userType) || !userType) {
                return response.status(409).json({success: false, message: "Wrong user_type for this resource"});
            }



            const user = await COLLECTIONS.get(userType).findOne({
                _id: decoded["_id"],
                email: decoded["email"],
                'tokens.token': token
            });


            if(user) {
                request[userType] = user;
                request.userType = userType;
                request.token = token;
                next();
            } else {
                response.status(401).json(NOT_AUTHORIZED);
            }
        } catch (e) {
            if(e instanceof  jwt.TokenExpiredError) {
                try {
                    const decoded = jwt.decode(token);
                    const userType = decoded["userType"];
                    if(!userType || !COLLECTIONS.has(userType)) {
                        return response.status(401).json({success: false, message: "Wrong user_type for this resource"});
                    }
                    const user = await COLLECTIONS.get(userType).findOne({_id: decoded["_id"], email: decoded["email"]});
                    if(user) {
                        user.tokens = user.tokens.filter((_token) => {
                            return _token["token"] !== token;
                        });
                        await user.save();
                    }
                    response.status(401).json({...NOT_AUTHORIZED, message: e.message});
                } catch (e1) {
                    errorHandler.hand(response, e1);
                }
            }
            else {
                errorHandler.hand(response, e);
            }
        }
    }
};



