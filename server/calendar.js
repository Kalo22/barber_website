/*
// server/calendar.js
const caldav = require('caldav');

// Define the credentials and server URL
const url = 'http://localhost:5232/collections/collection-root/kalo/fd600e6d-9189-0a9d-dff6-ae8e16da8faa/';
const username = 'kalo'; // Plain-text username
const password = '2213'; // Plain-text password

// Function to create a calendar event in Radicale
async function createCalendarEvent(appointment) {
    try {

        

        const event = {
            uid: appointment.id.toString(),
            summary: `Appointment with ${appointment.name}`,
            start: new Date(appointment.date + 'T' + appointment.time),
            duration: { hours: 1 },
        };

        await client.createEvent(event);
        console.log('Event created in Radicale successfully');
    } catch (error) {
        console.error('Error creating event in Radicale:', error);
        throw new Error('Failed to create calendar event');
    }
}

module.exports = { createCalendarEvent };
*/

// server/calendar.js
const https = require('http');

// Radicale server configuration
const RADICALE_SERVER_URL = 'localhost'; // Only the hostname, we'll include the port and path in the request
const RADICALE_PORT = 5232; // Port to your Radicale server
const CALENDAR_PATH = '/collections/collection-root/kalo/test/'; // Path to the user's calendar in Radicale
const USERNAME = 'kalo'; // Radicale username
const PASSWORD = '2213'; // Radicale password

/**
 * Create an iCalendar formatted event
 * @param {Object} appointment - Appointment details
 * @returns {string} - iCalendar formatted event
 */
function createICalEvent(appointment) {
    const { summary, description, start, end } = appointment;

    console.log('Appointment details:', appointment);
    console.log('App', appointment.name);
    console.log('App', appointment.email);
    console.log('App', appointment.date);
    console.log('App', appointment.time);

    const dstart = toISO8601(appointment.date, appointment.time);
    const newtime = addOneHour(appointment.time);
    const dend = toISO8601(appointment.date, newtime);

    console.log('Start:', appointment.start, 'End:', appointment.end);
    

    const uid = `${Date.now()}@example.com`; // Generate a unique ID for the event

    return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${appointment.start}
DTEND:${appointment.end}
SUMMARY:${appointment.name}
DESCRIPTION:${appointment.email}
END:VEVENT
END:VCALENDAR
    `;
}

/**
 * Format a Date object to iCalendar date-time format
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date-time string
 */
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid Date object');
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Create a calendar event on Radicale server
 * @param {Object} appointment - Appointment details
 * @returns {Promise} - A promise that resolves when the event is created
 */
function createCalendarEvent(appointment) {
    return new Promise((resolve, reject) => {
        const icalEvent = createICalEvent(appointment);
        const url = `${CALENDAR_PATH}${appointment.id}.ics`;
        const options = {
            hostname: RADICALE_SERVER_URL,
            port: RADICALE_PORT,
            path: url,
            method: 'PUT',
            headers: {
                'Content-Type': 'text/calendar',
                'Authorization': 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP error! status: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(icalEvent);
        req.end();
    });
}

function toISO8601(dateStr, timeStr) {
    // Combine date and time strings into a single date-time string
    const dateTimeStr = `${dateStr}T${timeStr}:00`;

    // Create a new Date object from the combined date-time string
    const date = new Date(dateTimeStr);

    // Return the ISO 8601 formatted string
    return date.toISOString();
}

function addOneHour(date) {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 1);
    return newDate;
}

module.exports = { createCalendarEvent };