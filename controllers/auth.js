const userService = require("../Services/user.service");
const authService = require("../Services/auth.service");

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
        validationError: [],
        isAuthenticated: req.session.isLoggedIn || false
    });
};

exports.postSignup = (req, res, next) => {
    userService.signUp(req).then(result => {
        req.flash("success", result);
        res.redirect("/login");
    }).catch(err => {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if(Array.isArray(err)){
            return res.status(422).render('auth/signup', {
                path: '/signup',
                pageTitle: 'Signup',
                errorMessage: null,
                validationError: err,
                isAuthenticated: req.session.isLoggedIn || false,
                oldInput: {email:email, password:password, confirmPassword: confirmPassword}
            });
        }else{
            req.flash("error", err);
            res.redirect("/signup");
        }
    });
};

exports.getReset = (req, res, next) => {
    let error = req.flash("error");
    if(error.length <= 0){
        error = null;
    }

    let success = req.flash("success");
    if(success.length <= 0){
        success = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: error,
        successMessage: success,
        isAuthenticated: req.session.isLoggedIn || false
    });
};

exports.postReset = (req, res, next) => {
    userService.resetPassword(req).then(res => {
        res.redirect("/");
    }).catch(err => {
        res.redirect("/reset");
    });
};

exports.getNewPassword = (req, res, next) => {
    let error = req.flash("error");
    if(error.length <= 0){
        error = null;
    }

    let success = req.flash("success");
    if(success.length <= 0){
        success = null;
    }
    authService.findUserByToken(req.params.token).then(user => {
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            userId : user._id.toString(),
            errorMessage: error,
            successMessage: success,
            isAuthenticated: req.session.isLoggedIn || false
        });
    }).catch(err => {
        if(err === "588"){
            req.flash("error", "Linked expired");
            return res.redirect("/login");
        }
        req.flash("error", "An error occured !");
        console.log(err);
        return res.redirect("/login");
    })

};

exports.PostNewPassword = (req, res, next) => {
    userService.SaveNewPassword(req).then(res => {
        res.redirect("/login");
    }).catch(err => {
        res.redirect("/login");
    });
};