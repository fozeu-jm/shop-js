const userService = require("../Services/user.service");
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login'
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup'
    });
};

exports.postSignup = (req, res, next) => {
    userService.signUp(req).then(result => {
        res.redirect("/login");
    }).catch(err => {
        console.log(err);
        res.redirect("/signup")
    });
};