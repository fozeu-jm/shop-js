const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const {check, body} = require("express-validator/check");
const User = require("../models/user");


router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.logout);

router.get("/signup", authController.getSignup);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.post("/signup",
    [
        check("email").isEmail().withMessage("Invalid email address !")
            .custom((value) => {
                return User.findOne({email: value}).then(user => {
                    if (user) {
                        return Promise.reject("User with same email already exist");
                    }
                });
            }).normalizeEmail(),
        body("password").isStrongPassword().withMessage("Password should be at least 8 characters " +
            "and contain a uppercase letter, number and a symbol").custom((value, {req}) => {
            if (value !== req.body.confirmPassword) {
                throw  new Error("Passwords have to be identical !")
            }
            return true;
        }).trim(),
        body("confirmPassword").trim()
    ],
    authController.postSignup);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.PostNewPassword);

module.exports = router;