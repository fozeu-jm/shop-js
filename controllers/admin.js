const productService = require('../Services/product.service');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
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
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
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
                product: product,
                isAuthenticated: req.session.isLoggedIn || false
            });
        })
        .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    productService.updateProduct(req)
        .then(result => {
            res.redirect('/admin/products');
        }).catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    productService.findAllProducts()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
                isAuthenticated: req.session.isLoggedIn || false
            });
        }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    productService.DeleteProduct(req)
        .then(() => {
            res.redirect('/admin/products');
        }).catch(err => console.log(err));
};
