const Product = require('../models/product');
const Order = require('../models/order');

exports.addToCart = (req) => {
    let user = req.user;
    const prodId = req.body.productId;
    return Product.findById(prodId)
        .then(product => {
            const cartProductIndex = user.cart.items.findIndex(cp => {
                return cp.productId.toString() === product._id.toString();
            });
            let newQuantity = 1;
            const updatedCartItems = [...user.cart.items];

            if (cartProductIndex >= 0) {
                newQuantity = user.cart.items[cartProductIndex].quantity + 1;
                updatedCartItems[cartProductIndex].quantity = newQuantity;
            } else {
                updatedCartItems.push({
                    productId: product._id,
                    quantity: newQuantity
                });
            }
            user.cart = {
                items: updatedCartItems
            };
            return user.save();
        }).catch(err => {
            console.log(err);
        });
};

exports.getCartContent = (user) => {
    return user.populate('cart.items.productId').execPopulate()
        .then(user => {
            return user.cart.items.map(item => {
                return {
                    ...item.productId._doc,
                    quantity: item.quantity
                };
            });
        }).catch(err => {
            console.log(err);
        });
};

exports.removeFromCart = (req) => {
    const productId = req.body.productId;
    const user = req.user;
    user.cart.items = user.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    return user.save();
};

exports.placeOrder = (user) => {
    return user.populate('cart.items.productId', 'title price').execPopulate()
        .then(user => {
            const cartContent = user.cart.items.map(item => {
                return {
                    productId: item.productId._doc._id,
                    title: item.productId._doc.title,
                    price: item.productId._doc.price,
                    quantity: item.quantity
                };
            });
            user.cart.items = [];
            console.log(cartContent);
            return user.save().then( res => {
                    const order = new Order({items: cartContent, userId: user._id});
                    return order.save();
                }).catch( err => {
                    //console.log(err);
                });
        }).catch(err => {
        console.log(err);
    });
};

exports.getOrders = () => {
    return Order.find();
};