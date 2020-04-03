const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');


const distributorOwnerSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    name: {
        type: String,
        default: null
    },
    is_main: {
        type: Schema.Types.Boolean,
        required: true
    }
}, {toJSON: {getters: true}});



distributorOwnerSchema.statics.findByCredentials = async (email, password, is_main) => {
    // Search for a user by email and password.
    const user = await DistributorOwner.findOne({email, is_main});
    if (!user) return null;

    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) return null;

    return user;
};


const DistributorOwner = mongoose.model('distributor_owners', distributorOwnerSchema);

module["exports"] = DistributorOwner;
