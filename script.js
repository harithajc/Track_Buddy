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

let calendarEvents = JSON.parse(localStorage.getItem('trackBuddyEventsV3')) || {};
let viewingDate = new Date(); 
let currentlySelectedDateKey = null; 
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendar() {
    calendarGrid.innerHTML = ''; 
    const year = viewingDate.getFullYear();
    const month = viewingDate.getMonth();
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayOfWeek; i++) calendarGrid.appendChild(document.createElement('div'));

    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('cal-day');
        dayElement.textContent = day;
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

prevMonthBtn.addEventListener('click', () => { viewingDate.setMonth(viewingDate.getMonth() - 1); renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { viewingDate.setMonth(viewingDate.getMonth() + 1); renderCalendar(); });

function openModal(day, dateKey) {
    currentlySelectedDateKey = dateKey;
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
    renderDayEventsList(); renderCalendar(); updateGreeting();
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
        modalOverlay.classList.remove('active'); renderCalendar(); updateGreeting();
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

let myTasks = JSON.parse(localStorage.getItem('trackBuddyTasks')) || [];

function updateStatusCard() {
    if (myTasks.length === 0) {
        statusPercent.textContent = "0%";
        statusBars.forEach(bar => bar.style.height = '10px');
        return;
    }
    const completed = myTasks.filter(t => t.done).length;
    const percent = Math.round((completed / myTasks.length) * 100);
    statusPercent.textContent = `${percent}%`;
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
    renderTasks(); updateStatusCard(); updateGreeting();
}

addTodoBtn.addEventListener('click', () => {
    const text = todoInput.value.trim();
    if (text !== '') { myTasks.push({ id: Date.now(), text: text, done: false }); todoInput.value = ''; saveAndRenderTasks(); }
});
todoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodoBtn.click(); });

// ==========================================
// 3. THE FOCUS TIMER ENGINE
// ==========================================
let timerInterval; let timeElapsed = 0; let isRunning = false;
const timerDisplay = document.getElementById('timer-display');
const timerInput = document.getElementById('timer-input');
const btnStartTimer = document.getElementById('btn-start-timer');
const btnResetTimer = document.getElementById('btn-reset-timer');

function updateTimerDisplay() {
    const m = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
    const s = (timeElapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
}

btnStartTimer.addEventListener('click', () => {
    if (isRunning) { clearInterval(timerInterval); btnStartTimer.textContent = 'Resume'; isRunning = false; } 
    else {
        timerInterval = setInterval(() => {
            timeElapsed++; updateTimerDisplay();
            const goalMinutes = parseInt(timerInput.value);
            if (goalMinutes && timeElapsed === goalMinutes * 60) alert(`Great job! Reached ${goalMinutes}-min focus goal!`);
        }, 1000);
        btnStartTimer.textContent = 'Pause'; isRunning = true;
    }
});

btnResetTimer.addEventListener('click', () => {
    clearInterval(timerInterval); isRunning = false; btnStartTimer.textContent = 'Start';
    timeElapsed = 0; updateTimerDisplay();
});

// ==========================================
// 4. THE EXPENSE ENGINE
// ==========================================
let totalSpent = parseInt(localStorage.getItem('trackBuddySpent')) || 0; 
const budgetDisplay = document.getElementById('budget-display');
const expenseInput = document.getElementById('expense-input');
const btnAddExpense = document.getElementById('btn-add-expense');
const btnResetExpense = document.getElementById('btn-reset-expense');

function renderExpenses() { budgetDisplay.textContent = `₹ ${totalSpent.toLocaleString()}`; }

btnAddExpense.addEventListener('click', () => {
    const spentAmount = parseInt(expenseInput.value);
    if (spentAmount && spentAmount > 0) {
        totalSpent += spentAmount; localStorage.setItem('trackBuddySpent', totalSpent); 
        expenseInput.value = ''; renderExpenses(); 
    }
});
btnResetExpense.addEventListener('click', () => {
    if (confirm("Reset expenses to zero?")) { totalSpent = 0; localStorage.setItem('trackBuddySpent', totalSpent); renderExpenses(); }
});

// ==========================================
// 5. THE MOOD ENGINE
// ==========================================
const moodIcons = document.querySelectorAll('.mood-icon');
const moodText = document.getElementById('mood-text');
const moodMessages = { "😴": "tired but functional", "😭": "absolutely defeated", "😄": "having a pretty good day", "🥳": "crushing it today!", "💀": "dead inside (academic weapon down)", "🤔": "slightly confused but trying", "🤒": "under the weather" };
let savedMood = localStorage.getItem('trackBuddyMood') || "😐";

function setMood(moodEmoji) {
    moodIcons.forEach(icon => { icon.classList.remove('active-mood'); if (icon.dataset.mood === moodEmoji) icon.classList.add('active-mood'); });
    moodText.textContent = `Current mood: ${moodMessages[moodEmoji] || 'unknown'}`;
    localStorage.setItem('trackBuddyMood', moodEmoji);
}
moodIcons.forEach(icon => icon.addEventListener('click', () => setMood(icon.dataset.mood)));

// ==========================================
// 6. THE GREETING ENGINE
// ==========================================
const greetingTitle = document.getElementById('greeting-title');
const greetingSubtitle = document.getElementById('greeting-subtitle');

function updateGreeting() {
    const currentHour = new Date().getHours();
    let timeOfDay = "evening";
    if (currentHour < 12) timeOfDay = "morning";
    else if (currentHour < 18) timeOfDay = "afternoon";
    greetingTitle.textContent = `Good ${timeOfDay}, Haritha`;

    const pendingTasks = myTasks.filter(task => !task.done).length;
    let totalEvents = 0;
    for (const day in calendarEvents) { totalEvents += calendarEvents[day].length; }

    const quirkyMessages = [
        "and 2 things looking directly at you.",
        "time to activate academic weapon mode.",
        "and 1 coffee waiting to be brewed.",
        "so let's get things done!",
        "and your budget is looking healthy."
    ];
    const randomQuirk = quirkyMessages[Math.floor(Math.random() * quirkyMessages.length)];
    greetingSubtitle.textContent = `You have ${pendingTasks} pending tasks, ${totalEvents} upcoming events, ${randomQuirk}`;
}

// ==========================================
// 7. THE SIDEBAR NAVIGATION ENGINE (SPA UPGRADE)
// ==========================================
const menuItems = document.querySelectorAll('.menu-item');
const viewSections = document.querySelectorAll('.view-section');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const pageTarget = item.dataset.page;
        const targetView = document.getElementById(`view-${pageTarget}`);

        if (targetView) {
            menuItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            viewSections.forEach(view => view.classList.remove('active'));
            targetView.classList.add('active');
        } 
        else if (pageTarget !== 'Settings') {
            alert(`The ${pageTarget} view is currently locked. You need to build the HTML for it next!`);
        }
    });
});

// ==========================================
// 8. THE WEEKLY PLANNER ENGINE
// ==========================================
const plannerGrid = document.getElementById('weekly-planner-grid');
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const startHour = 8; // 8 AM
const endHour = 22; // 10 PM

function renderWeeklyPlanner() {
    if (!plannerGrid) return;
    plannerGrid.innerHTML = '';

    const timeCol = document.createElement('div');
    timeCol.classList.add('planner-col', 'time-label-col');
    timeCol.innerHTML = `<div class="day-title">Time</div>`;
    
    for (let h = startHour; h <= endHour; h++) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        timeCol.innerHTML += `<div class="time-label">${displayH} ${ampm}</div>`;
    }
    plannerGrid.appendChild(timeCol);

    daysOfWeek.forEach(day => {
        const dayCol = document.createElement('div');
        dayCol.classList.add('planner-col');
        dayCol.innerHTML = `<div class="day-title">${day}</div>`;

        for (let h = startHour; h <= endHour; h++) {
            const slot = document.createElement('div');
            slot.classList.add('time-slot');
            slot.addEventListener('click', () => {
                alert(`You clicked ${day} at ${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}! Next up: letting you save classes here.`);
            });
            dayCol.appendChild(slot);
        }
        plannerGrid.appendChild(dayCol);
    });
}

// ==========================================
// INITIALIZE EVERYTHING ON LOAD
// ==========================================
renderCalendar();
saveAndRenderTasks(); 
updateTimerDisplay();
renderExpenses();
setMood(savedMood);
updateGreeting();
renderWeeklyPlanner();