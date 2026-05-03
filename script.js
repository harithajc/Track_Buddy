// ==========================================
// 1. THE DYNAMIC CALENDAR ENGINE
// ==========================================
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthDisplay = document.getElementById('current-month-display');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

const modalOverlay = document.getElementById('event-modal');
const modalDayTitle = document.getElementById('modal-day-title');
const eventNameInput = document.getElementById('modal-event-name');
const eventTimeInput = document.getElementById('modal-event-time');
const btnSaveEvent = document.getElementById('btn-save-event');
const btnCancelEvent = document.getElementById('btn-cancel-event');
const dayEventsList = document.getElementById('day-events-list');

// We use V3 for the memory key because we are upgrading how data is saved!
let calendarEvents = JSON.parse(localStorage.getItem('trackBuddyEventsV3')) || {};

// Grab the REAL current date from the computer
let viewingDate = new Date(); 
let currentlySelectedDateKey = null; 
let currentlySelectedDayNumber = null;

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendar() {
    calendarGrid.innerHTML = ''; 
    
    // Figure out exactly what year and month we are looking at
    const year = viewingDate.getFullYear();
    const month = viewingDate.getMonth();
    
    // Update the text at the top (e.g., "June 2026")
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    // Math to figure out what day the 1st falls on, and how many days are in the month
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Draw empty slots for the days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    // Draw the actual days
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('cal-day');
        dayElement.textContent = day;

        // Create a unique key (e.g., "2026-5-15") so May 15 and June 15 don't mix!
        const dateKey = `${year}-${month}-${day}`;

        if (calendarEvents[dateKey] && calendarEvents[dateKey].length > 0) {
            const dot = document.createElement('div');
            dot.classList.add('event-dot');
            dayElement.appendChild(dot);
            dayElement.classList.add('marked');
        }

        dayElement.addEventListener('click', () => openModal(day, dateKey));
        calendarGrid.appendChild(dayElement);
    }
}

// Wire up the Arrow Buttons!
prevMonthBtn.addEventListener('click', () => {
    viewingDate.setMonth(viewingDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    viewingDate.setMonth(viewingDate.getMonth() + 1);
    renderCalendar();
});

function openModal(day, dateKey) {
    currentlySelectedDateKey = dateKey;
    currentlySelectedDayNumber = day;
    modalDayTitle.textContent = `Events for ${monthNames[viewingDate.getMonth()]} ${day}`;
    eventNameInput.value = ''; eventTimeInput.value = '';
    renderDayEventsList();
    modalOverlay.classList.add('active'); 
}

function renderDayEventsList() {
    dayEventsList.innerHTML = '';
    const eventsForToday = calendarEvents[currentlySelectedDateKey] || [];
    if (eventsForToday.length === 0) {
        dayEventsList.innerHTML = '<i>No events yet.</i>';
        return;
    }
    eventsForToday.forEach((evt, index) => {
        const div = document.createElement('div');
        div.classList.add('mini-event');
        div.innerHTML = `<span><b>${evt.time}</b> - ${evt.name}</span><button class="delete-day-event" onclick="deleteEvent('${currentlySelectedDateKey}', ${index})">×</button>`;
        dayEventsList.appendChild(div);
    });
}

window.deleteEvent = function(dateKey, eventIndex) {
    calendarEvents[dateKey].splice(eventIndex, 1);
    localStorage.setItem('trackBuddyEventsV3', JSON.stringify(calendarEvents));
    renderDayEventsList(); renderCalendar();
    if (typeof updateGreeting === "function") updateGreeting(); // Updates the top text if you delete an event
};

btnCancelEvent.addEventListener('click', () => modalOverlay.classList.remove('active'));
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

btnSaveEvent.addEventListener('click', () => {
    const name = eventNameInput.value.trim();
    const rawTime = eventTimeInput.value; 
    let displayTime = "";
    if (rawTime) {
        const timeParts = rawTime.split(':');
        let hours = parseInt(timeParts[0], 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; hours = hours ? hours : 12; 
        displayTime = `${hours < 10 ? '0'+hours : hours}:${timeParts[1]} ${ampm}`;
    }
    if (name) {
        if (!calendarEvents[currentlySelectedDateKey]) calendarEvents[currentlySelectedDateKey] = [];
        calendarEvents[currentlySelectedDateKey].push({ name: name, time: displayTime });
        localStorage.setItem('trackBuddyEventsV3', JSON.stringify(calendarEvents));
        modalOverlay.classList.remove('active'); renderCalendar(); 
        if (typeof updateGreeting === "function") updateGreeting(); // Updates the top text when you add an event
    }
});
// ==========================================
// 2. THE TO-DO LIST & DYNAMIC STATUS ENGINE
// ==========================================
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const statusPercent = document.getElementById('status-percent');
const statusBars = document.querySelectorAll('.bar');

let myTasks = JSON.parse(localStorage.getItem('trackBuddyTasks')) || [
    { id: 1, text: "Finish Figma layout", done: true },
    { id: 2, text: "Build HTML/CSS", done: false }
];

function updateStatusCard() {
    if (myTasks.length === 0) {
        statusPercent.textContent = "0%";
        statusBars.forEach(bar => bar.style.height = '10px');
        return;
    }
    // Calculate percentage based on checkboxes
    const completed = myTasks.filter(t => t.done).length;
    const percent = Math.round((completed / myTasks.length) * 100);
    statusPercent.textContent = `${percent}%`;

  
    // Animate the bar chart based on the percentage!
    // Multipliers lowered drastically so the tallest bar is only 50px
    statusBars[0].style.height = `${Math.max(12, percent * 0.2)}px`;
    statusBars[1].style.height = `${Math.max(12, percent * 0.4)}px`;
    statusBars[2].style.height = `${Math.max(12, percent * 0.3)}px`;
    statusBars[3].style.height = `${Math.max(12, percent * 0.5)}px`;
}

function renderTasks() {
    todoList.innerHTML = ''; 
    myTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.classList.add('todo-item');
        if (task.done) taskDiv.classList.add('done');
        taskDiv.innerHTML = `<input type="checkbox" class="todo-checkbox" ${task.done ? 'checked' : ''}><div class="todo-text">${task.text}</div><button class="delete-btn">×</button>`;
        taskDiv.querySelector('.todo-checkbox').addEventListener('change', function() {
            task.done = this.checked; saveAndRenderTasks();
        });
        taskDiv.querySelector('.delete-btn').addEventListener('click', function() {
            myTasks = myTasks.filter(t => t.id !== task.id); saveAndRenderTasks();
        });
        todoList.appendChild(taskDiv);
    });
}

function saveAndRenderTasks() {
    localStorage.setItem('trackBuddyTasks', JSON.stringify(myTasks));
    renderTasks();
    updateStatusCard(); 
    updateGreeting(); // Updates the greeting whenever tasks change!
}

addTodoBtn.addEventListener('click', function() {
    const text = todoInput.value.trim();
    if (text !== '') {
        myTasks.push({ id: Date.now(), text: text, done: false });
        todoInput.value = ''; saveAndRenderTasks();
    }
});
todoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodoBtn.click(); });


// ==========================================
// 3. THE FOCUS TIMER ENGINE (Pink Card - Stopwatch Mode)
// ==========================================
let timerInterval;
let timeElapsed = 0; // We start fresh at exactly 0 seconds!
let isRunning = false;

const timerDisplay = document.getElementById('timer-display');
const timerInput = document.getElementById('timer-input'); // Now acts as an optional Goal
const btnStartTimer = document.getElementById('btn-start-timer');
const btnResetTimer = document.getElementById('btn-reset-timer');

function updateTimerDisplay() {
    const m = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
    const s = (timeElapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
}

btnStartTimer.addEventListener('click', () => {
    if (isRunning) {
        // Pause the timer
        clearInterval(timerInterval);
        btnStartTimer.textContent = 'Resume';
        isRunning = false;
    } else {
        // Start or Resume counting UP
        timerInterval = setInterval(() => {
            timeElapsed++; // Adds 1 second
            updateTimerDisplay();

            // Check if the user set a goal in the input box!
            const goalMinutes = parseInt(timerInput.value);
            if (goalMinutes && timeElapsed === goalMinutes * 60) {
                alert(`Great job! You reached your ${goalMinutes}-minute focus goal!`);
            }
        }, 1000);
        btnStartTimer.textContent = 'Pause';
        isRunning = true;
    }
});

btnResetTimer.addEventListener('click', () => {
    // Stop the timer and reset everything back to zero
    clearInterval(timerInterval);
    isRunning = false;
    btnStartTimer.textContent = 'Start';
    timeElapsed = 0; // Back to zero!
    updateTimerDisplay();
});

// Force the display to show 00:00 as soon as the page loads
updateTimerDisplay();


// ==========================================
// 4. THE EXPENSE ENGINE (Green Card)
// ==========================================
let totalSpent = parseInt(localStorage.getItem('trackBuddySpent')) || 0; 
const budgetDisplay = document.getElementById('budget-display');
const expenseInput = document.getElementById('expense-input');
const btnAddExpense = document.getElementById('btn-add-expense');
const btnResetExpense = document.getElementById('btn-reset-expense'); // Grabbing our new button!

function renderExpenses() {
    budgetDisplay.textContent = `₹ ${totalSpent.toLocaleString()}`;
}

btnAddExpense.addEventListener('click', () => {
    const spentAmount = parseInt(expenseInput.value);
    if (spentAmount && spentAmount > 0) {
        totalSpent += spentAmount; 
        localStorage.setItem('trackBuddySpent', totalSpent); 
        expenseInput.value = ''; 
        renderExpenses(); 
    }
});

// --- NEW RESET LOGIC ---
btnResetExpense.addEventListener('click', () => {
    // A built-in browser confirmation box to prevent accidental clicks
    if (confirm("Are you sure you want to reset your expenses to zero?")) {
        totalSpent = 0; // Reset the math
        localStorage.setItem('trackBuddySpent', totalSpent); // Save the zero to memory
        renderExpenses(); // Update the screen
    }
});

// ==========================================
// 5. THE MOOD ENGINE (Blue Card)
// ==========================================
const moodIcons = document.querySelectorAll('.mood-icon');
const moodText = document.getElementById('mood-text');
const moodMessages = {
    "😴": "tired and sleepy",
    "😭": "absolutely defeated",
    "😄": "having a pretty good day",
    "🥳": "crushing it today!",
    "💀": "dead inside (academic weapon down)",
    "🤔": "slightly confused but trying",
    "🤒": "under the weather"
};
let savedMood = localStorage.getItem('trackBuddyMood') || "😐";

function setMood(moodEmoji) {
    moodIcons.forEach(icon => {
        icon.classList.remove('active-mood');
        if (icon.dataset.mood === moodEmoji) icon.classList.add('active-mood');
    });
    moodText.textContent = `Current mood: ${moodMessages[moodEmoji] || 'unknown'}`;
    localStorage.setItem('trackBuddyMood', moodEmoji);
}

moodIcons.forEach(icon => {
    icon.addEventListener('click', () => setMood(icon.dataset.mood));
});

// ==========================================
// 6. THE DYNAMIC GREETING ENGINE
// ==========================================
const greetingTitle = document.getElementById('greeting-title');
const greetingSubtitle = document.getElementById('greeting-subtitle');

function updateGreeting() {
    // 1. Figure out the time of day
    const currentHour = new Date().getHours();
    let timeOfDay = "evening";
    if (currentHour < 12) timeOfDay = "morning";
    else if (currentHour < 18) timeOfDay = "afternoon";

    greetingTitle.textContent = `Good ${timeOfDay}, Haritha`;

    // 2. Count pending tasks (tasks where 'done' is false)
    const pendingTasks = myTasks.filter(task => !task.done).length;

    // 3. Count total upcoming events saved in the calendar
    let totalEvents = 0;
    for (const day in calendarEvents) {
        totalEvents += calendarEvents[day].length;
    }

    // 4. A few quirky randomized messages for the end of the sentence
    const quirkyMessages = [
        "and 2 things looking directly at you.",
        "time to activate academic weapon mode.",
        "and 1 coffee waiting to be brewed.",
        "so let's get things done!",
        "and your budget is looking healthy."
    ];
    const randomQuirk = quirkyMessages[Math.floor(Math.random() * quirkyMessages.length)];

    // 5. Update the text on the screen!
    greetingSubtitle.textContent = `You have ${pendingTasks} pending tasks, ${totalEvents} upcoming events, ${randomQuirk}`;
}
// ==========================================
// 7. THE SIDEBAR NAVIGATION ENGINE
// ==========================================
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // 1. Remove the 'active' highlight from all buttons
        menuItems.forEach(nav => nav.classList.remove('active'));
        
        // 2. Add the 'active' highlight to the one we just clicked
        item.classList.add('active');

        // 3. Check which page they are trying to go to
        const pageTarget = item.dataset.page;
        
        // If it's not the dashboard, let them know it's under construction!
        if (pageTarget !== 'Dashboard') {
            alert(`The ${pageTarget} view is currently locked. You need to build the HTML for it next!`);
            
            // Force the highlight back to the Dashboard after a short delay
            setTimeout(() => {
                item.classList.remove('active');
                document.querySelector('[data-page="Dashboard"]').classList.add('active');
            }, 500);
        }
    });
});
// INITIALIZE EVERYTHING ON LOAD
renderCalendar();
saveAndRenderTasks(); // This also triggers updateStatusCard()
updateTimerDisplay();
renderBudget();
setMood(savedMood);
updateGreeting();