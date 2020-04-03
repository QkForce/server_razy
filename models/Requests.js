const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const requestSchema = new Schema({
    distributor: {
        ref: 'users',
        type: Schema.Types.ObjectId,
        required: true
    },
    client: {
        ref: 'users',
        type: Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});


module["exports"] = mongoose.model('requests', requestSchema);