const https = require('https'); // Ensure you're using the correct module

const RADICALE_SERVER_URL = 'cal.batnako.net'; // Correct hostname
const RADICALE_PORT = 443; // Default port for HTTPS
const CALENDAR_PATH = '/testuser/efba3538-fccd-3ecb-d678-2859a01f6a00/'; // Path to the calendar
const USERNAME = 'testuser'; // Radicale username
const PASSWORD = 'testpassword'; // Radicale password

/**
 * Create an iCalendar formatted event
 * @param {Object} appointment - Appointment details
 * @returns {string} - iCalendar formatted event
 */
function createICalEvent(appointment) {
    const { summary, description, start, end } = appointment;

    const uid = `${Date.now()}@example.com`; // Generate a unique ID for the event

    return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${summary}
DESCRIPTION:${description}
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
                'Authorization': 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64'),
                'Content-Length': Buffer.byteLength(icalEvent)
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
                    reject(new Error(`HTTP error! status: ${res.statusCode}, response: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Request error: ${e.message}`));
        });

        req.write(icalEvent);
        req.end();
    });
}

/**
 * Convert date and time to ISO 8601 format
 * @param {string} dateStr - The date string
 * @param {string} timeStr - The time string
 * @returns {string} - ISO 8601 formatted date-time string
 */
function toISO8601(dateStr, timeStr) {
    const dateTimeStr = `${dateStr}T${timeStr}:00Z`; // Append timezone information
    return new Date(dateTimeStr).toISOString();
}

module.exports = { createCalendarEvent };