const crypto = require("crypto");
const User = require("../models/user");


exports.generateResetToken = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32, (err, buffer) => {
            if(err){
                console.log(err);
                reject(err);
            }
            const token = buffer.toString("hex");
            resolve(token);
        });
    });
};

exports.findUserByToken = (token) => {
    return new Promise((resolve, reject) => {
        User.findOne( {resetToken: token} ).then(user => {
            if(!user){
                reject("No user found !");
            }
            if(user.resetTokenExpiration < Date.now()){
                reject("588");
            }
            resolve(user);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
};