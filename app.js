const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Tools = require("./util/config");
const multer = require("multer");

const errorController = require('./controllers/error');
const User = require('./models/user');

const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const MONGODB_URI = process.env.MONGODB_URI;
const logger = require("./util/config");

const app = express();
const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const fileStorage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Math.floor(new Date().getTime() / 1000) + '-' + file.originalname);
    },
    destination: (req, file, cb) => {
        cb(null, './uploads');
    }
});

const fileFilter = (req, file, cb) => {
    let authorizedEXtensions = [".png", ".jpg", ".jpeg", ".gif"];
    if(authorizedEXtensions.includes(path.extname(file.originalname).toLowerCase())){
        cb(null, true);
    }else{
        cb(null, false);
    }
};

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single("image"));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads",express.static(path.join(__dirname, 'uploads')));

app.use(
    session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

const csrfProtection = csrf(options = {});

app.use(csrfProtection);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
});
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/505', errorController.get505);

app.use(errorController.get404);

//error handling middleware
app.use((err, req, res, next) => {
    Tools.logger.error({name: err.name, message: err.message, trace: err.stack});
    res.redirect("/505");
});

mongoose.connect(MONGODB_URI).then((result) => {
    app.listen(3000);
}).catch(err => {
    Tools.logger.error({name: err.name, message: err.message});
    return Promise.reject(err);
});