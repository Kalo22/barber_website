const https = require('https');
const { v4: uuidv4 } = require('uuid'); // Import the UUID library

// Function to format current date as DTSTAMP
function formatCurrentDate() {
    const date = new Date();
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Generate a unique UID
const uniqueUID = uuidv4() + '@your-domain.com'; // Append a domain to ensure it resembles an email address

// iCalendar data with a dynamically generated timestamp and UID
const icalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Product//Your Company//EN
BEGIN:VEVENT
UID:${uniqueUID}
DTSTAMP:${formatCurrentDate()}
DTSTART:20240728T090000Z
DTEND:20240728T100000Z
SUMMARY:Meeting with Client
DESCRIPTION:Discuss project updates
LOCATION:Conference Room
END:VEVENT
END:VCALENDAR`;

const options = {
    hostname: 'cal.batnako.net',
    port: 443, // Use 443 for HTTPS
    path: `/testuser/efba3538-fccd-3ecb-d678-2859a01f6a00/${uniqueUID}.ics`, // Use the UID for the file path
    method: 'PUT',
    headers: {
        'Content-Type': 'text/calendar',
        'Authorization': 'Basic ' + Buffer.from('testuser:testpassword').toString('base64'), // Adjust username and password
        'Content-Length': Buffer.byteLength(icalData),
    }
};

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
        } else if (res.statusCode === 409) {
            console.error('Conflict Error:', data);
        } else {
            console.error('Failed Request:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e.message);
});

req.write(icalData);
req.end();