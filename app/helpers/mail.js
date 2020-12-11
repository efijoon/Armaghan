const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testnodemailery@gmail.com', // generated ethereal user
        pass: '@Imnodemailer85' // generated ethereal password
    }
});

module.exports = transporter;