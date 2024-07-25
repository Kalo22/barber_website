#!/bin/bash

# CalDAV server URL
CALDAV_SERVER_URL="https://cal.batnako.net"
# Calendar URL or ID
CALENDAR_URL="/testuser/efba3538-fccd-3ecb-d678-2859a01f6a00/"
# Username and Password
USERNAME="testuser"
PASSWORD="testpassword"

# Appointment details in ICS format
APPOINTMENT_DATA="BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Product//Your Company//EN
BEGIN:VEVENT
UID:$(uuidgen)@your-domain.com
DTSTAMP:$(date -u +"%Y%m%dT%H%M%SZ")
DTSTART:20240728T090000Z
DTEND:20240728T100000Z
SUMMARY:Meeting with Client
DESCRIPTION:Discuss project updates
LOCATION:Conference Room
END:VEVENT
END:VCALENDAR"

# UUID for the new appointment
UUID=$(uuidgen)

# Make the HTTP PUT request to create the appointment
curl -X PUT "${CALDAV_SERVER_URL}${CALENDAR_URL}${UUID}.ics" \
     --user "${USERNAME}:${PASSWORD}" \
     -H "Content-Type: text/calendar; charset=utf-8" \
     --data "$APPOINTMENT_DATA"

echo "Appointment created with UUID: $UUID"
