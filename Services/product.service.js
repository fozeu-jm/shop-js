const Product = require('../models/product');

exports.saveProduct = (req) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user
    });
    return product.save();
};

exports.findAllProducts = () => {
    // can use Product.find().select('title price -_id') to select and exclude fields
    // .populate('userId', 'name');
    return Product.find().populate('userId');
};

exports.findProductById = (req) => {
    const prodId = req.params.productId;
    return Product.findById(prodId);
};

exports.updateProduct = (req) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;

    return Product.findById(prodId)
        .then((product) => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            product.imageUrl = updatedImageUrl;
            return product.save();
        }).catch(err => {
            console.log(err);
        });
};

exports.DeleteProduct = (req) => {
    const prodId = req.body.productId;
    return Product.findByIdAndRemove(prodId);
};