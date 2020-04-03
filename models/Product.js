const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const keys = require('../config/keys');
const FKHelper = require('../shared/utils/foreignKeyHelper');


const productSchema = new Schema({
    distributor: {
        ref: 'distributors',
        type: Schema.Types.ObjectId,
        required: true,
        validate: {
            validator: function (distributor_id) {
                return FKHelper.check(mongoose.model('distributors'), distributor_id);
            },
            message: "Distributor does't exist"
        }
    },
    name: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: null,
        get: image => image ? image : keys.default_product_image
    },
    price: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: null
    }
}, {toJSON: {getters: true}});

productSchema.pre('findOneAndUpdate', function (next) {
    this._update.updated_at *= 1000;
    next();
});


module["exports"] = mongoose.model('products', productSchema);