const userService = require("../Services/user.service");

exports.getLogin = (req, res, next) => {
    let error = req.flash("error");
    if(error.length <= 0){
        error = null;
    }

    let success = req.flash("success");
    if(success.length <= 0){
        success = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: error,
        successMessage: success,
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
        req.flash("error", err);
        return res.redirect("/login");
    });
};

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect("/");
    });
};

exports.getSignup = (req, res, next) => {
    let error = req.flash("error");
    if(error.length <= 0){
        error = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: error,
        isAuthenticated: req.session.isLoggedIn || false
    });
};

exports.postSignup = (req, res, next) => {
    userService.signUp(req).then(result => {
        req.flash("success", result);
        res.redirect("/login");
    }).catch(err => {
        req.flash("error", err);
        res.redirect("/signup");
    });
};