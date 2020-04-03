const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

module["exports"] = function (_id, email, userType) {
    return jwt.sign({_id, email, userType}, keys.jwt, {expiresIn: 15 * 60 * 60});
};

