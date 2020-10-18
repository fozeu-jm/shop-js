const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userShchema = new Schema({
    email: {type: String, required: true},
    password:{ type: String, required: true},
    cart: {
        items: [
            {
                productId: {type: Schema.Types.ObjectID, ref: 'Product', required: true},
                quantity: {type: Number, required: true}
            }
        ]
    }
});

module.exports = mongoose.model('User', userShchema);
