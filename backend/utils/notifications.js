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

const sendEmail = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({ 
            from: `"${process.env.APP_NAME || 'HealthHub AI'}" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            text,
            html 
        });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error('Email error:', err);
    }
};

const sendWelcomeEmail = async (user) => {
    const isDonor = user.role === 'donor';
    const subject = `Welcome to HealthHub AI, ${user.name}! 🚀`;
    
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 20px; background: #f8fafc;">
            <h1 style="color: #0d9488; text-align: center;">HealthHub<span style="color: #6366f1;">AI</span></h1>
            <h2 style="color: #1e293b; text-align: center;">Identity Verified. Welcome aboard!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Hi <strong>${user.name}</strong>,
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Your clinical identity has been successfully established as a <strong>${user.role.toUpperCase()}</strong>. 
                ${isDonor ? 'Your contribution to the donor network is invaluable and will help save lives in your local community.' : 'You can now access AI-driven triage, book appointments, and manage your health records seamlessly.'}
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                   style="background: linear-gradient(to right, #0d9488, #4f46e5); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                    Access Your Dashboard
                </a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center; font-weight: bold;">
                NEURAL MONITORING ENABLED • HEALTHHUB AI CORE v1.0
            </p>
        </div>
    `;

    await sendEmail(user.email, subject, `Welcome to HealthHub AI, ${user.name}! Your account as a ${user.role} has been created.`, html);
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

module.exports = { sendEmail, sendWelcomeEmail, sendSMS };
