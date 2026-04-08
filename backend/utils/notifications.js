const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error('Email error:', err);
    }
};

const sendSMS = async (to, body) => {
    try {
        await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_PHONE,
            to
        });
        console.log(`SMS sent to ${to}`);
    } catch (err) {
        console.error('SMS error:', err);
    }
};

module.exports = { sendEmail, sendSMS };
