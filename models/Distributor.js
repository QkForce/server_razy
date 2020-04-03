const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');



const distributorSchema = new Schema({
    distributor_owner: {
        type: Schema.Types.ObjectId,
        ref: 'distributor_owners',
        required: true
    },
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
    image: {
        type: String,
        default: null,
        get: image => {
            return image ? image : keys.default_distributor_image;
        }
    },
    name: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    trucks_count: {
      type: Number,
      required: true,
    }
}, {toJSON: {getters: true}});







distributorSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await Distributor.findOne({email});
    if (!user) return null;

    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) return null;

    return user;
};


const Distributor = mongoose.model('distributors', distributorSchema);

module["exports"] = Distributor;