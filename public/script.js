document.addEventListener('DOMContentLoaded', function() {
    // Initialize Pikaday
    var picker = new Pikaday({
        field: document.getElementById('datepicker'),
        bound: false,  // Always show the calendar
        format: 'YYYY-MM-DD',
        onSelect: function(date) {
            // Format the selected date in Bulgaria timezone
            const formattedDate = moment(date).tz('Europe/Sofia').format('YYYY-MM-DD HH:mm:ss');
    
            // Display the formatted date
            document.getElementById('selected-date').textContent = formattedDate;
            console.log('Formatted Date in Bulgaria Timezone:', formattedDate);
        },
        disableDayFn: function(date) {
            // Disable dates before today
            return date < new Date().setHours(0, 0, 0, 0);
        }
    });

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
});

// Form submission event listener
const form = document.getElementById('appointmentForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const date = formData.get('date');
    const time = formData.get('time');
    
    const startDateTime = `${date}T${time}:00Z`;
    const endDateTime = `${date}T${time}:00Z`;
    
    const appointmentData = {
        id: Date.now(),
        confirmed: false,
        name: formData.get('name'),
        email: formData.get('email'),
        start: startDateTime,
        end: endDateTime,
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
