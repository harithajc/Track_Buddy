// ==========================================
// 1. THE SUPER-FUNCTIONAL CALENDAR ENGINE
// ==========================================
const calendarGrid = document.getElementById('calendar-grid');
const startingDayOfWeek = 5; 
const totalDaysInMonth = 31;

// Modal Elements
const modalOverlay = document.getElementById('event-modal');
const modalDayTitle = document.getElementById('modal-day-title');
const eventNameInput = document.getElementById('modal-event-name');
const eventTimeInput = document.getElementById('modal-event-time');
const btnSaveEvent = document.getElementById('btn-save-event');
const btnCancelEvent = document.getElementById('btn-cancel-event');
const dayEventsList = document.getElementById('day-events-list');

// Calendar Database
let calendarEvents = JSON.parse(localStorage.getItem('trackBuddyEventsV2')) || {};
let currentlySelectedDay = null; 

function renderCalendar() {
    calendarGrid.innerHTML = ''; 

    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('cal-day');
        dayElement.textContent = day;

        // If this day has events saved, draw the pink dot
        if (calendarEvents[day] && calendarEvents[day].length > 0) {
            const dot = document.createElement('div');
            dot.classList.add('event-dot');
            dayElement.appendChild(dot);
            dayElement.classList.add('marked');
        }

        // Click day to open popup
        dayElement.addEventListener('click', function() {
            openModal(day);
        });

        calendarGrid.appendChild(dayElement);
    }
}

function openModal(day) {
    currentlySelectedDay = day;
    modalDayTitle.textContent = `Events for May ${day}`;
    eventNameInput.value = ''; 
    eventTimeInput.value = '';
    
    renderDayEventsList();
    modalOverlay.classList.add('active'); 
}

function renderDayEventsList() {
    dayEventsList.innerHTML = '';
    const eventsForToday = calendarEvents[currentlySelectedDay] || [];
    
    if (eventsForToday.length === 0) {
        dayEventsList.innerHTML = '<i>No events yet.</i>';
        return;
    }

    eventsForToday.forEach((evt, index) => {
        const div = document.createElement('div');
        div.classList.add('mini-event');
        div.innerHTML = `
            <span><b>${evt.time}</b> - ${evt.name}</span>
            <button class="delete-day-event" onclick="deleteEvent(${currentlySelectedDay}, ${index})">×</button>
        `;
        dayEventsList.appendChild(div);
    });
}

window.deleteEvent = function(day, eventIndex) {
    calendarEvents[day].splice(eventIndex, 1);
    localStorage.setItem('trackBuddyEventsV2', JSON.stringify(calendarEvents));
    renderDayEventsList();
    renderCalendar();
};

// --- UPGRADED POPUP CLOSING LOGIC ---
btnCancelEvent.addEventListener('click', () => {
    modalOverlay.classList.remove('active'); 
});

modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

// --- UPGRADED TIME FORMATTING & SAVE LOGIC ---
btnSaveEvent.addEventListener('click', () => {
    const name = eventNameInput.value.trim();
    const rawTime = eventTimeInput.value; 

    // Convert 24hr time into AM/PM format
    let displayTime = "";
    if (rawTime) {
        const timeParts = rawTime.split(':');
        let hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const paddedHours = hours < 10 ? '0' + hours : hours;
        
        displayTime = `${paddedHours}:${minutes} ${ampm}`;
    }

    if (name) {
        if (!calendarEvents[currentlySelectedDay]) {
            calendarEvents[currentlySelectedDay] = [];
        }
        
        calendarEvents[currentlySelectedDay].push({ name: name, time: displayTime });
        localStorage.setItem('trackBuddyEventsV2', JSON.stringify(calendarEvents));
        
        modalOverlay.classList.remove('active'); 
        renderCalendar(); 
    }
});

// ==========================================
// 2. THE TO-DO LIST ENGINE
// ==========================================
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

let myTasks = JSON.parse(localStorage.getItem('trackBuddyTasks')) || [
    { id: 1, text: "Finish Figma layout", done: true },
    { id: 2, text: "Build HTML/CSS", done: false }
];

function renderTasks() {
    todoList.innerHTML = ''; 
    myTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.classList.add('todo-item');
        if (task.done) taskDiv.classList.add('done');

        taskDiv.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${task.done ? 'checked' : ''}>
            <div class="todo-text">${task.text}</div>
            <button class="delete-btn">×</button>
        `;

        taskDiv.querySelector('.todo-checkbox').addEventListener('change', function() {
            task.done = this.checked;
            saveAndRenderTasks();
        });

        taskDiv.querySelector('.delete-btn').addEventListener('click', function() {
            myTasks = myTasks.filter(t => t.id !== task.id);
            saveAndRenderTasks();
        });

        todoList.appendChild(taskDiv);
    });
}

function saveAndRenderTasks() {
    localStorage.setItem('trackBuddyTasks', JSON.stringify(myTasks));
    renderTasks();
}

addTodoBtn.addEventListener('click', function() {
    const text = todoInput.value.trim();
    if (text !== '') {
        myTasks.push({ id: Date.now(), text: text, done: false });
        todoInput.value = '';
        saveAndRenderTasks();
    }
});

todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTodoBtn.click();
});

// INITIALIZE EVERYTHING
renderCalendar();
renderTasks();