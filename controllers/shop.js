const Product = require('../models/product');
const productService = require('../Services/product.service');
const userService = require('../Services/user.service');

exports.getProducts = (req, res, next) => {
    productService.findAllProducts()
        .then((products) => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
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
                path: '/products'
            });
        })
        .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
    productService.findAllProducts()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
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
                products: products
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

exports.postOrder = (req, res, next) => {
    userService.placeOrder(req.user).then( result => {
        res.redirect('/orders');
    }).catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    userService.getOrders().then(orders => {
            res.render('shop/orders', {

                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            });
        }).catch(err => console.log(err));
};
