const productService = require('../Services/product.service');
const Product = require('../models/product');
const deleter = require("../util/deleter");
const config = require("../util/config");

exports.getAddProduct = (req, res, next) => {
    let error = req.flash("error");
    if (error.length <= 0) {
        error = null;
    }
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        errorMessage: error,
        editing: false,
        isAuthenticated: req.session.isLoggedIn || false
    });
};

exports.postAddProduct = (req, res, next) => {
    productService.saveProduct(req)
        .then((result) => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            req.flash('error', err);
            res.redirect('/admin/add-product');
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    let error = req.flash("error");
    if (error.length <= 0) {
        error = null;
    }
    productService.findProductById(req)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                errorMessage: error,
                product: product,
                isAuthenticated: req.session.isLoggedIn || false
            });
        }).catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    productService.updateProduct(req)
        .then(result => {
            res.redirect('/admin/products');
        }).catch(err => console.log(err));
};

exports.getProducts = async (req, res, next) => {
    const totalItems = await Product.find().countDocuments();
    const page = parseInt(req.query.page || "1");
    const itemsPerPage = parseInt(req.query.limit || config.defaultElmtPerPage);
    productService.findAllProducts(req)
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
                totalItems: totalItems,
                hasNextPage: itemsPerPage * page < totalItems,
                hasPreviousPage: page > 1,
                currentPage: page,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / itemsPerPage),
                isAuthenticated: req.session.isLoggedIn || false
            });
        }).catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
    productService.DeleteProduct(req).then(() => {
        res.status(200).json({message: "Success !"});
    }).catch(err => {
        res.status(500).json({message: "An error occurred !"});
    });
};
