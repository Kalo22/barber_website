// server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const session = require('express-session');
const { sendConfirmationEmail } = require('./email');
const { createCalendarEvent } = require('./calendar.js');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// In-memory storage for pending and confirmed appointments
let pendingAppointments = [];
let confirmedAppointments = [];

// Endpoint to create a new appointment
app.post('/appointments', (req, res) => {
    const appointment = { id: Date.now(), confirmed: false, ...req.body };
    pendingAppointments.push(appointment);

    // Send confirmation email
    sendConfirmationEmail(appointment)
        .then(() => {
            res.status(201).json({ message: 'Appointment created, please confirm via email.' });
        })
        .catch(error => {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Error creating appointment, please try again later.' });
        });
});

// Endpoint to confirm appointment
app.get('/confirm/:id', async (req, res) => {
    const appointmentId = parseInt(req.params.id, 10);
    const appointmentIndex = pendingAppointments.findIndex(a => a.id === appointmentId);

    if (appointmentIndex !== -1) {
        const [appointment] = pendingAppointments.splice(appointmentIndex, 1);
        confirmedAppointments.push(appointment);

        // Create calendar event in Radicale
        try {
            await createCalendarEvent(appointment);
            res.status(200).send('Appointment confirmed and added to calendar.');
        } catch (error) {
            console.error('Error adding appointment to calendar:', error);
            res.status(500).send('Error confirming appointment, please try again later.');
        }
    } else {
        res.status(404).send('Appointment not found or already confirmed.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
