const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require("../middleware/is-auth");
const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

/*router.post('/create-order', isAuth, shopController.postOrder);*/

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/file/:orderId', isAuth, shopController.printOrder);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/checkout/cancel', shopController.getCheckOut);

router.get("/checkout", isAuth, shopController.getCheckOut)

module.exports = router;
