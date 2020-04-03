const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FKHelper = require('../shared/utils/foreignKeyHelper');



const ORDER_STATUSES = {
    unperformed: 0,
    canceled: 1,
    completed_courier: 2,
    completed_client: 3,
};



const orderSchema = new Schema({
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
    distributor_name: {
        type: String,
        required: true
    },
    route: {
        type: Schema.Types.ObjectId,
        ref: 'routes',
        default: null,
        validate: [
            {
                validator: (route) => !route || (route && this.status !== ORDER_STATUSES.unperformed),
                message: "The order isn't unperformed"
            },
            {
                validator: id => {
                    return FKHelper.nullableRoute(id);
                },
                message: "Route does't exist"
            }
        ]
    },
    list: [
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
                min: 1
            },
            count2: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    client: {
        ref: 'clients',
        type: Schema.Types.ObjectId,
        required: true,
        validate: {
            validator: function (client_id) {
                return FKHelper.check(mongoose.model('clients'), client_id);
            },
            message: "Courier does't exist"
        }
    },
    client_name: {
        type: String,
        required: true
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
    start: {
        type: Date,
        required: true
    },
    end1: {
        type: Date,
        default: null
    },
    end2: {
        type: Date,
        default: null
    },
    status: {
        type: Number,
        enum: Object.values(ORDER_STATUSES),
        min: 0,
        max: Object.values(ORDER_STATUSES).length - 1,
        required: true
    }
});



module["exports"].STATUSES = ORDER_STATUSES;
module["exports"].model = mongoose.model('orders', orderSchema);