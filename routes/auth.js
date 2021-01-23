const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.logout);

router.get("/signup", authController.getSignup);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.post("/signup", authController.postSignup);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.PostNewPassword);

module.exports = router;