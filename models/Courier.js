const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const FKHelper = require('../shared/utils/foreignKeyHelper');


const courierSchema = new Schema({
    distributor: {
        type: Schema.Types.ObjectId,
        ref: 'distributors',
        required: true,
        validate: {
            validator: function (distributor_id) {
                return FKHelper.check(mongoose.model('distributors'), distributor_id);
            },
            message: "Distributor does't exist"
        }
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
        get: image => image ? image : keys.default_courier_image
    },
    name: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
}, { toJSON: { getters: true } });


courierSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await Courier.findOne({ email });
    if (!user) return null;

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return null;

    return user;
};


const Courier = mongoose.model('couriers', courierSchema);


module["exports"] = Courier;