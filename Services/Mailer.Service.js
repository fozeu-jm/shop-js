const nodeMailer = require("nodeMailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const transporter = nodeMailer.createTransport({
    host: 'mx-dc03.ewodi.net',
    port : 587,
    auth: {
        user: 'contact@kaizerwebdesign.com',
        pass: 'Jeanmarie1234;'
    }
});

exports.signUpEmail = async (email) => {
    let data = await ejs.renderFile(
        path.join(__dirname, '..', 'views', 'emails/') + "signup.ejs",
        {
            name: email.split('@')[0],
            email:email
        });
    return transporter.sendMail({
        to : email,
        from : 'contact@kaizerwebdesign.com',
        subject: "Account created successfully !",
        html: data
    });
};

exports.resetPasswordEmail = (email, token) => {
    return transporter.sendMail({
        to : email,
        from : 'contact@kaizerwebdesign.com',
        subject: "Password reset | SHOP-JS",
        html: `
            <p>You requested a password reset. The link will only be available for one hour.</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a></p>
        `
    });
};