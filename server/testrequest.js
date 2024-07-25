const https = require('https');

const options = {
    hostname: 'cal.batnako.net',
    port: 443,
    path: '/testuser/efba3538-fccd-3ecb-d678-2859a01f6a00/test.ics',
    method: 'PUT',
    headers: {
        'Content-Type': 'text/calendar',
        'Authorization': 'Basic ' + Buffer.from('testuser:testpassword').toString('base64'),
        'Content-Length': Buffer.byteLength('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR')
    }
};

const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Headers:', res.headers);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.write('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR');
req.end();
