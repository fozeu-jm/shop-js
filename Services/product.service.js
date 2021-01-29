const Product = require('../models/product');
const Tools = require("../util/config");
const fs = require("fs");
const path = require("path")
const deleter = require("../util/deleter");

exports.saveProduct = (req) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if (!image) {
        return Promise.reject("File is not an image !")
    }
    const imageUrl = image.path;
    const product = new Product({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user
    });
    return product.save().then(res => {
        return Promise.resolve(res);
    }).catch(err => {
        Tools.logger.error(err);
        return Promise.reject("Could not save product ! PLease try again later");
    });
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
    const updatedImage = req.file;
    const updatedDesc = req.body.description;

    return Product.findById(prodId)
        .then((product) => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            const oldPath = product.imageUrl;
            if (updatedImage) {
                product.imageUrl = updatedImage.path;
            }
            return product.save().then(res => {
                if (updatedImage) {
                    deleter.deleteFile(oldPath);
                }
                return Promise.resolve();
            }).catch(err => {
                Tools.logger.error(err);
                return Promise.reject("An error occured while updating the product.")
            });
        }).catch(err => {
            console.log(err);
        });
};

exports.DeleteProduct = (req) => {
    const prodId = req.body.productId;
    return Product.findById(prodId).then(product => {
        return Product.findByIdAndRemove(prodId).then(res => {
            deleter.deleteFile(product.imageUrl);
            return Promise.resolve();
        }).catch(reason => {
            return Promise.reject(reason);
        });
    }).catch(reason => {
        return Promise.reject(reason);
    });
};

exports.printOrder = (req) => {
    const orderId = req.params.orderId;
    const filename = "invoice-".concat(orderId, ".pdf");
    const filepath = path.join("data", "invoices", filename);
    /*return new Promise((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            if (err) {
                Tools.logger.error(err);
                return reject("An error occured !");
            }
            const response = {
                data : data,
                filename : filename
            };
            return resolve(response);
        });
    });*/
    return {
        file: fs.createReadStream(filepath),
        filename: filename
    };
};