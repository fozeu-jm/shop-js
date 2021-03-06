const User = require("../models/user");
const Product = require('../models/product');
const Order = require('../models/order');
const bcrypt = require('bcryptjs');
const mailer = require("./Mailer.Service");
const auth = require("./auth.service");
const {validationResult} = require("express-validator/check")

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
    return user.populate('cart.items.productId')
        .execPopulate()
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
    /**
     * populate() fetches data with corresponding id from db and populates productId field in the object with th data
     * second argument selects which fields to populate from the db
     */
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
            return user.save().then(res => {
                const order = new Order({items: cartContent, userId: user._id});
                return order.save();
            }).catch(err => {
                //console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
};

exports.getOrders = (req) => {
    return Order.find({userId: req.user._id});
};

exports.signUp = (req) => {
    const email = req.body.email;
    const password = req.body.password;

    return new Promise((resolve, reject) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return reject(errors.array());
        }
        bcrypt.hash(password, 12).then((hashedPass) => {
            const newUser = new User({email: email, password: hashedPass, cart: {items: []}});
            newUser.save().then(result => {
                mailer.signUpEmail(email).then(res => {
                }).catch(err => {
                    console.log(err);
                });
                return resolve("User account created successfully !");
            });
        }).catch(err => {
            console.log(err);
            return reject("An error occurred during sign up process please try again later.")
        });
    });
};

exports.signIn = (req) => {
    const email = req.body.email;
    const password = req.body.password;
    return new Promise((resolve, reject) => {
        User.findOne({email: email}).then(user => {
            if (!user) {
                return reject("Invalid email or password.");
            }
            bcrypt.compare(password, user.password).then(doMatch => {
                return doMatch ? resolve(user) : reject("Invalid email or password.");
            }).catch(err => {
                return reject("An error occured during authentication. Try again later.")
            })
        }).catch(err => {
            return reject("An error occured during authentication. Try again later");
        });
    });
};

exports.resetPassword = (req) => {
    return new Promise((resolve, reject) => {
        User.findOne({email: req.body.email}).then(user => {
            if (!user) {
                req.flash('error', 'No account with that email found.');
                reject('error');
            }
            auth.generateResetToken().then(token => {
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                user.save().then(res => {
                    mailer.resetPasswordEmail(req.body.email, token).then(res => {
                    }).catch(err => {
                        console.log(err);
                    });
                    req.flash('success', 'An email was sent to reset your password');
                    resolve("Success !");
                }).catch(err => {
                    req.flash('error', 'An unexpected error occurred, please try later.');
                    reject(err);
                });
            }).catch(err => {
                req.flash('error', 'An unexpected error occurred, please try later.');
                reject(err);
            });
        }).catch(err => {
            reject("Problem with query !");
        });
    });
};

exports.SaveNewPassword = (req) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    return new Promise((resolve, reject) => {
        User.findById(userId).then(user => {
            if (!user) {
                req.flash('error', 'An error occurred, please try again later');
                reject("err");
            }
            if (user.resetTokenExpiration < Date.now()) {
                req.flash('error', 'An error occurred, please try again later');
                reject("588");
            }
            bcrypt.hash(newPassword, 12).then((hashedPass) => {
                user.password = hashedPass;
                user.resetToken = undefined;
                user.resetTokenExpiration = undefined;
                user.save().then(res => {
                    req.flash('success', 'Password changed successfully');
                    resolve("success");
                }).catch(err => {
                    req.flash('error', 'An error occurred, please try again later');
                    reject(err);
                })
            }).catch(err => {
                req.flash('error', 'An error occurred, please try again later');
                reject("An error occurred during sign up process please try again later.")
                console.log(err);
            });
        }).catch(err => {
            req.flash('error', 'An error occurred, please try again later');
            reject(err);
        });
    });
};