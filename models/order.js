const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    items: [{
        productId: {type: Schema.Types.ObjectID, ref: 'Product', required: true},
        title: {type: String, required: true},
        price: {type: Number, required: true},
        quantity: {type: Number, required: true},
    }],
    userId: {type: Schema.Types.ObjectID, ref: 'User', required: true}
});

module.exports = mongoose.model('Order', orderSchema);
