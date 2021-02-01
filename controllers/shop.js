const Product = require('../models/product');
const productService = require('../Services/product.service');
const userService = require('../Services/user.service');
const PDFDocument = require("pdfkit");
const config = require("../util/config");
const path = require("path");
const stripe = require("stripe")('sk_test_51IFlPOG15lWG0HoWtA9UoznCvEYAJd2c7mtl6tJjuoIwU02tIynEEAUdTKKvtChmtj21tN7XI3xp4VxV4Idl678e00vwPFuQnO');
exports.getProducts = async (req, res, next) => {
    const totalItems = await Product.find().countDocuments();
    const page = parseInt(req.query.page || "1");
    const itemsPerPage = parseInt(req.query.limit || config.defaultElmtPerPage);

    productService.findAllProducts(req)
        .then((products) => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                totalItems: totalItems,
                hasNextPage: itemsPerPage * page < totalItems,
                hasPreviousPage: page > 1,
                currentPage: page,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / itemsPerPage),
                isAuthenticated: req.session.isLoggedIn || false
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getProduct = (req, res, next) => {
    productService.findProductById(req)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products',
                isAuthenticated: req.session.isLoggedIn || false
            });
        }).catch(err => console.log(err));
};

exports.getIndex = async (req, res, next) => {
    const totalItems = await Product.find().countDocuments();
    const page = parseInt(req.query.page || "1");
    const itemsPerPage = parseInt(req.query.limit || config.defaultElmtPerPage);

    productService.findAllProducts(req)
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                totalItems: totalItems,
                hasNextPage: itemsPerPage * page < totalItems,
                hasPreviousPage: page > 1,
                currentPage: page,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / itemsPerPage),
                isAuthenticated: req.session.isLoggedIn || false
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getCart = (req, res, next) => {
    userService.getCartContent(req.user)
        .then(products => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products,
                isAuthenticated: req.session.isLoggedIn || false
            });
        }).catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
    userService.addToCart(req)
        .then((result) => {
            console.log(result);
            res.redirect('/cart');
        }).catch(err => {
        console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
    userService.removeFromCart(req).then(result => {
        res.redirect('/cart');
    }).catch(err => console.log(err));
};

exports.getCheckoutSuccess = (req, res, next) => {
    userService.placeOrder(req.user).then(result => {
        res.redirect('/orders');
    }).catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    userService.getOrders(req).then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders,
            isAuthenticated: req.session.isLoggedIn || false
        });
    }).catch(err => console.log(err));
};

exports.printOrder = (req, res, next) => {
    productService.printOrder(req).then(result => {
        res.setHeader('content-Type', 'application/pdf');
        res.setHeader("Content-Disposition", "inline; filename=".concat(result.filename))
        result.file.pipe(res);
    }).catch(err => console.log(err));
};

exports.getCheckOut = (req, res, next) => {
    userService.getCartContent(req.user)
        .then(products => {
            let total = 0;
            products.forEach(p => {
                total += p.quantity * p.price;
            });
            stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: p.title,
                                /*images: [req.protocol + '://' + req.get('host') + products[0].imageUrl.split("\\").join("/")],*/
                            },
                            unit_amount: p.price * 100,
                        },
                        quantity: p.quantity,
                    };
                }),
                mode: 'payment',
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            }).then(session => {
                res.render('shop/checkout', {
                    path: '/checkout',
                    pageTitle: 'Checkout',
                    products: products,
                    sessionId: session,
                    totalPrice: total,
                    isAuthenticated: req.session.isLoggedIn || false
                });
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => console.log(err));
}
