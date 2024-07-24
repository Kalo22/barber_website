// server/email.js
const nodemailer = require('nodemailer');

// Create a Nodemailer transporter using your email service credentials
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service
    auth: {
        user: 'kalo.mladenov@gmail.com',
        pass: 'lfvv krkb ozjh apaw'
    }
});

// Function to send confirmation email
function sendConfirmationEmail(appointment) {
    const confirmationUrl = `http://localhost:3000/confirm/${appointment.id}`;
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: appointment.email,
        subject: 'Confirm your appointment',
        text: `Please confirm your appointment by clicking on the following link: ${confirmationUrl}`
    };

    return transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmationEmail };
