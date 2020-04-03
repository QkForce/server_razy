const mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const FKHelper = require('../shared/utils/foreignKeyHelper');


const clientSchema = new Schema({
    bin: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        default: () => {
            const a = shortid.generate();
            return a.substr(0, 4).toUpperCase() + '-' + a.substr(4).toUpperCase();
        }
    },
    password: {
        type: String,
        required: true,
        default: shortid.generate,
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
        get: image => image ? image : keys.default_client_image
    },
    name: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    address: {
        type: String,
        required: true,
    },
    lng: {
        type: Number,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    distributors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'distributors',
            required: true,
            validate: {
                validator: function (distributor_id) {
                    return FKHelper.check(mongoose.model('distributors'), distributor_id);
                },
                message: "Distributor does't exist"
            }
        }
    ]
}, {toJSON: {getters: true}});


clientSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await Client.findOne({email});
    if (!user) return null;

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return null;

    return user;
};


const Client = mongoose.model('clients', clientSchema);


module["exports"] = Client;