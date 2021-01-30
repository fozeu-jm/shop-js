const Product = require('../models/product');
const Tools = require("../util/config");
const fs = require("fs");
const ejs = require("ejs");
const Order = require('../models/order');
const path = require("path");
const deleter = require("../util/deleter");
const pdf = require("pdf-creator-node");

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

exports.printOrder = async (req) => {
    const orderId = req.params.orderId;
    const filename = "invoice-".concat(orderId, ".pdf");
    const filepath = path.join("data", "invoices", filename);

    const templatePath = path.join("views", "pdf",);

    let order = null;
    let html = null;
    try {
        order = await Order.findById(orderId);
        html = await ejs.renderFile(path.join(__dirname, '..', 'views', 'pdf', "order-template.ejs"), {order: order});
    } catch (err) {
        Tools.logger.error(err);
        return Promise.reject(err);
    }
    let options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        header: {
            height: "45mm",
            contents: `<H1 style="text-align: center;">Your Order - ${order._id}</H1>`
        },
        "footer": {
            "height": "10mm",
            "contents": {
                first: '',
                2: '', // Any page number is working. 1-based index
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: ''
            }
        }
    };
    let document = {
        html: html,
        data: {
            users: ""
        },
        path: filepath
    };
    return pdf.create(document, options).then(res => {
        let result = {
            file: fs.createReadStream(filepath),
            filename: filename};
        return Promise.resolve(result);
    }).catch(error => {
        return Promise.reject(error);
    });
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
};