const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FKHelper = require('../shared/utils/foreignKeyHelper');

const ROUTE_STATUSES = {
    created: 0,
    active: 1,
    completed: 2
};

const routeSchema = new Schema({
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
    courier: {
        ref: 'couriers',
        type: Schema.Types.ObjectId,
        default: null,
        validate: {
            validator: function (courier_id) {
                return FKHelper.check(mongoose.model('couriers'), courier_id, true);
            },
            message: "Courier does't exist"
        }
    },
    courier_name: {
        type: String,
        default: null
    },
    orders: [
        {
            ref: 'orders',
            type: Schema.Types.ObjectId,
        }
    ],
    inventory: [
        {
            product: {
                type: Schema.Types.ObjectId,
                required: true,
                validate: {
                    validator: function (product_id) {
                        return FKHelper.check(mongoose.model('products'), product_id);
                    },
                    message: "Product does't exist"
                }
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            count1: {
                type: Number,
                required: true,
                min: 0
            },
            count2: {
                type: Number,
                default: 0,
                min: 0
            },
            count3: {
                type: Number,
                default: 0,
                min: 0
            }
        }
    ],
    date: {
        type: Date,
        required: true
    },
    status: {
        type: Number,
        enum: Object.values(ROUTE_STATUSES),
        min: 0,
        max: Object.values(ROUTE_STATUSES).length - 1,
        required: true
    }
});


module["exports"].STATUSES = ROUTE_STATUSES;

module["exports"].model = mongoose.model('routes', routeSchema);