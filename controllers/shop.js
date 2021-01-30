const Product = require('../models/product');
const productService = require('../Services/product.service');
const userService = require('../Services/user.service');
const PDFDocument = require("pdfkit");
const config = require("../util/config");

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

exports.postOrder = (req, res, next) => {
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
