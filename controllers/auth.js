const userService = require("../Services/user.service");

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn || false
    });
};

exports.postLogin = (req, res, next) => {
    userService.signIn(req).then(user => {
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
            res.redirect("/");
        });
    }).catch(err => {
        res.redirect("/login");
    });
};

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect("/");
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: req.session.isLoggedIn || false
    });
};

exports.postSignup = (req, res, next) => {
    userService.signUp(req).then(result => {
        res.redirect("/login");
    }).catch(err => {
        console.log(err);
        res.redirect("/signup");
    });
};