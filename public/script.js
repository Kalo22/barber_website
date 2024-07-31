document.addEventListener('DOMContentLoaded', function() {
    let selectedDate = ''; // Variable to hold the selected date
    let selectedTime = ''; // Variable to hold the selected time

    // Initialize Pikaday
    var picker = new Pikaday({
        field: document.getElementById('datepicker'),
        bound: false,  // Always show the calendar
        format: 'YYYY-MM-DD',
        onSelect: function(date) {
            // Format the selected date
            const newSelectedDate = moment(date).tz('Europe/Sofia').format('YYYY-MM-DD');

            // Check if the same date is clicked again
            if (newSelectedDate === selectedDate) {
                // Reset the selected date and time
                selectedDate = '';
                selectedTime = '';

                // Update the displayed date
                document.getElementById('selected-date').textContent = 'None';

                // Hide the hours section
                document.getElementById('hours-section').classList.add('hidden');
            } else {
                // Update the selected date
                selectedDate = newSelectedDate;

                // Display the formatted date
                document.getElementById('selected-date').textContent = selectedDate;

                // Show the hours section and populate hours
                document.getElementById('hours-section').classList.remove('hidden');
                populateHours(selectedDate); // Pass formatted date to populateHours
            }
        },
        disableDayFn: function(date) {
            // Disable dates before today
            return date < new Date().setHours(0, 0, 0, 0);
        }
    });

    // Function to populate hours in the hours section
    function populateHours(selectedDate) {
        const hoursContainer = document.getElementById('hours-container');
        hoursContainer.innerHTML = ''; // Clear previous hours

        for (let i = 9; i < 20; i++) {
            const hour = i < 10 ? `0${i}:00` : `${i}:00`;
            const button = document.createElement('div');
            button.textContent = hour;
            button.className = 'hour-button';
            button.addEventListener('click', function() {
                selectedTime = hour; // Update the selected time

                // Update the selected date with the chosen time
                const formattedDateTime = moment(`${selectedDate} ${hour}`).tz('Europe/Sofia').format('YYYY-MM-DD HH:mm:ss');
                document.getElementById('selected-date').textContent = formattedDateTime;

                // Hide the hours section
                document.getElementById('hours-section').classList.add('hidden');
            });
            hoursContainer.appendChild(button);
        }
    }

    // Function to update navigation text
    function updateNavigationText() {
        const prevButton = document.querySelector('.pika-prev');
        const nextButton = document.querySelector('.pika-next');
        if (prevButton) prevButton.textContent = '←';
        if (nextButton) nextButton.textContent = '→';
    }

    // Function to extract text until the second capital letter
    function getTextUntilSecondCapital(text) {
        let capitalCount = 0;
        for (let i = 0; i < text.length; i++) {
            if (/[A-Z]/.test(text[i])) {
                capitalCount++;
                if (capitalCount === 2) return text.substring(0, i);
            }
        }
        return text;
    }

    // Function to disable the prev button if the displayed month is the current month
    function makePrevButtonInactive() {
        const monthLabel = document.querySelector('.pika-title .pika-label');
        if (monthLabel) {
            const monthText = getTextUntilSecondCapital(monthLabel.textContent.trim());
            const currentMonthName = getCurrentMonthName();
            if (monthText === currentMonthName) {
                document.querySelector('.pika-prev').classList.add('inactive');
            }
        }
    }

    // Function to disable the next button if the displayed month is 3 months from the current month
    function makeNextButtonInactive() {
        const monthLabel = document.querySelector('.pika-title .pika-label');
        if (monthLabel) {
            const monthText = getTextUntilSecondCapital(monthLabel.textContent.trim());
            const currentMonthIndex = getCurrentMonthIndex();
            const monthNames = getMonthNames();
            const shownMonthIndex = monthNames.indexOf(monthText);
            if (shownMonthIndex === (currentMonthIndex + 3) % 12) {
                document.querySelector('.pika-next').classList.add('inactive');
            }
        }
    }

    // Get the current month name
    function getCurrentMonthName() {
        const monthNames = getMonthNames();
        return monthNames[new Date().getMonth()];
    }

    // Get the current month index
    function getCurrentMonthIndex() {
        return new Date().getMonth();
    }

    // Get month names array
    function getMonthNames() {
        return ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
    }

    // Initial call to update navigation text and disable buttons
    updateNavigationText();
    makePrevButtonInactive();
    makeNextButtonInactive();

    // Observe changes in the Pikaday calendar and update text and buttons
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                updateNavigationText();
                makePrevButtonInactive();
                makeNextButtonInactive();
            }
        }
    });

    const calendarRoot = document.querySelector('.pika-single');
    if (calendarRoot) {
        observer.observe(calendarRoot, { childList: true, subtree: true });
    }

    // Form submission event listener
    const form = document.getElementById('appointmentForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if both date and time are selected
        if (!selectedDate || !selectedTime) {
            document.getElementById('message').textContent = 'Please select both a date and a time.';
            return;
        }

        const formData = new FormData(form);
        
        // Use the selectedDate and selectedTime variables for start and end datetime
        const startDateTime = `${selectedDate} ${selectedTime}:00Z`;
        const endDateTime = `${selectedDate} ${selectedTime}:00Z`;
        
        const appointmentData = {
            id: Date.now(),
            confirmed: false,
            name: formData.get('name'),
            email: formData.get('email'),
            start: startDateTime,
            end: endDateTime,
            phone: formData.get('phone'),
        };

        const response = await fetch('/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });

        const result = await response.json();
        document.getElementById('message').textContent = result.message;

        if (response.ok) form.reset();
    });
});
