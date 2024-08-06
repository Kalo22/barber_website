const https = require('https'); // Ensure you're using the correct module
const { v4: uuidv4 } = require('uuid'); // Import the UUID library

// ---------------- Create Appointment ---------------- //

function createICalEvent(appointment) {  //function to create an event containing the correct event structure
    const {phone, email, name, start} = appointment; //gets the properties of the appointment that was created through the form
    const uid = `${uuidv4()}`; // Generate a new UID for each event
    const newend = new Date(new Date(start).getTime() + 60 * 60 * 1000); //calculates the time at which the appt ends (+1hr)

    // Format event details
    const icalData = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//Your Product//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatCurrentDate()}
DTSTART:${toICalendarFormat(start)}
DTEND:${toICalendarFormat(newend)}
SUMMARY:Meeting with Client
DESCRIPTION:Name: ${name}\\nPhone: ${phone}\\nEmail: ${email}
LOCATION:Masquerade salon
END:VEVENT
END:VCALENDAR`;

    // Debug: Log the generated iCal data
    console.log('Generated iCal Event:\n', icalData);

    return { uid, icalData };
}

/**
 * Create a calendar event on Radicale server
 * @param {Object} appointment - Appointment details
 * @returns {Promise} - A promise that resolves when the event is created
 */
function createCalendarEvent(appointment) {
    return new Promise((resolve, reject) => {
        const { uid, icalData } = createICalEvent(appointment);
        const options = {
            hostname: 'cal.batnako.net',
            port: 443, // Use 443 for HTTPS
            path: `/testuser/efba3538-fccd-3ecb-d678-2859a01f6a00/${uid}.ics`, // Use the UID for the file path
            method: 'PUT',
            headers: {
                'Content-Type': 'text/calendar',
                'Authorization': 'Basic ' + Buffer.from('testuser:testpassword').toString('base64'), // Adjust username and password
                'Content-Length': Buffer.byteLength(icalData),
            }
        };

        console.log('Request Options:', options); // Log the request options for debugging

        const req = https.request(options, (res) => {
            let data = '';

            console.log('Status Code:', res.statusCode);
            console.log('Response Headers:', res.headers);
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('Event Created Successfully:', data);
                    resolve(data);
                } else if (res.statusCode === 409) {
                    console.error('Conflict Error:', data);
                    reject(new Error('Conflict Error'));
                } else {
                    console.error('Failed Request:', data);
                    reject(new Error('Failed Request'));
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request Error:', e.message);
            reject(e);
        });
        
        req.write(icalData);
        req.end();
    });
}

// ---------------- Valid Hours Query ---------------- //



function createICalQuery(day) {
    const start = day;
    const end = new Date(new Date(day).getTime() + 24 * 60 * 60 * 1000);
    
    const query = 
`<?xml version="1.0" encoding="UTF-8" ?>
<C:calendar-query xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop xmlns:D="DAV:">
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${toICalendarFormat(start)}Z" end="${toICalendarFormat(end)}Z"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;
    
    console.log("Generate Query:", query);
    
    return query;
}

function getValidHours(day) {
    return new Promise((resolve, reject) => {
        const icalData = createICalQuery(day);
        const options = {
            hostname: 'cal.batnako.net',
            port: 443, // Use 443 for HTTPS
            path: `/testuser/efba3538-fccd-3ecb-d678-2859a01f6a00/`,
            method: 'REPORT',
            headers: {
                'Content-Type': 'application/xml',
                'Authorization': 'Basic ' + Buffer.from('testuser:testpassword').toString('base64'), // Adjust username and password
                'Content-Length': Buffer.byteLength(icalData),
            }
        };

        console.log('Request Options:', options); // Log the request options for debugging
          
        const req = https.request(options, (res) => {
            let data = '';

            console.log('Status Code:', res.statusCode);
            console.log('Response Headers:', res.headers);
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    let dates = [];
                    const regex = new RegExp(`DTSTART\\s*:\\s*(.*)`, 'g');
                    
                    let match;
                    while ((match = regex.exec(data)) !== null) {
                        dates.push(match[1])
                    }
                    
                    resolve(dates);
                } else {
                    console.error('Failed Request:', data);
                    reject(new Error('Failed Request'));
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request Error:', e.message);
            reject(e);
        });
        
        req.write(icalData);
        req.end();
    });
}

// ---------------- Util ---------------- //

function toICalendarFormat(isoDateString) {
    // Create a Date object from the ISO string
    const date = new Date(isoDateString);

    // Check if date is invalid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }

    // Format the date to iCalendar format (YYYYMMDDTHHMMSSZ)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0];
}

function formatCurrentDate() { //function to format current date
    const date = new Date();
    return date.toISOString().replace(/[-:]/g, '').split('.')[0];
}


module.exports = { createCalendarEvent, getValidHours };
