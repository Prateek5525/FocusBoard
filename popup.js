document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const toggleTimerVisibilityBtn = document.getElementById('toggle-timer-visibility-btn');
    const timerDisplay = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const pauseTimerBtn = document.getElementById('pause-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    const toggleModeBtn = document.getElementById('toggle-mode-btn');
    const pomodoroContainer = document.getElementById('pomodoro-container');

    const workMinutesInput = document.getElementById('work-minutes');
    const breakMinutesInput = document.getElementById('break-minutes');
    const setCustomTimeBtn = document.getElementById('set-custom-time-btn');

    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const quadrants = document.querySelectorAll('.quadrant');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // --- Pomodoro Timer Variables ---
    let WORK_TIME = 25 * 60; // Default 25 minutes in seconds
    let BREAK_TIME = 5 * 60; // Default 5 minutes in seconds
    let timeRemaining = WORK_TIME;
    let timerState = 'work'; // 'work' or 'break'
    let intervalId = null;
    let isTimerRunning = false;
    let isTimerVisible = false; // New variable to track timer section visibility

    // --- Task Management Variables ---
    let tasks = []; // Array to store task objects: { id, content, quadrant }
    let draggedTaskId = null;

    // --- Audio for Timer Alert ---
    const alarmSound = new Audio(chrome.runtime.getURL('sounds/alarm.mp3'));

    // --- Pomodoro Timer Functions ---

    /**
     * Updates the timer display with the current time remaining in MM:SS format.
     */
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Starts the Pomodoro timer.
     * Prevents multiple intervals from running simultaneously.
     */
    function startTimer() {
        if (isTimerRunning) return; // Prevent multiple intervals
        isTimerRunning = true;
        startTimerBtn.disabled = true;
        pauseTimerBtn.disabled = false;
        resetTimerBtn.disabled = false;
        toggleModeBtn.disabled = true; // Disable mode toggle while timer is active
        setCustomTimeBtn.disabled = true; // Disable custom time setting while running

        intervalId = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(intervalId);
                isTimerRunning = false;
                playAlarm();
                switchMode(); // Automatically switch to break/work mode after session ends
                startTimerBtn.disabled = false; // Re-enable start button
                pauseTimerBtn.disabled = true; // Disable pause button
                toggleModeBtn.disabled = false; // Re-enable mode toggle
                setCustomTimeBtn.disabled = false; // Re-enable custom time setting
            }
            saveTimerState(); // Save timer state to storage on each tick
        }, 1000);
    }

    /**
     * Pauses the Pomodoro timer.
     */
    function pauseTimer() {
        clearInterval(intervalId); // Stop the timer interval
        isTimerRunning = false;
        startTimerBtn.disabled = false; // Re-enable start button
        pauseTimerBtn.disabled = true; // Disable pause button
        toggleModeBtn.disabled = false; // Re-enable mode toggle
        setCustomTimeBtn.disabled = false; // Re-enable custom time setting
        saveTimerState(); // Save timer state when paused
    }

    /**
     * Resets the Pomodoro timer to its default time for the current mode.
     */
    function resetTimer() {
        clearInterval(intervalId); // Stop the timer interval
        isTimerRunning = false;
        timeRemaining = (timerState === 'work' ? WORK_TIME : BREAK_TIME); // Set time based on current mode
        updateTimerDisplay();
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        resetTimerBtn.disabled = false; // Keep reset enabled
        toggleModeBtn.disabled = false; // Re-enable mode toggle
        setCustomTimeBtn.disabled = false; // Re-enable custom time setting
        saveTimerState(); // Save timer state when reset
    }

    /**
     * Switches between work and break modes, updating UI and timer duration.
     */
    function switchMode() {
        clearInterval(intervalId); // Stop any running timer before switching
        isTimerRunning = false; // Ensure timer is not running after switch

        if (timerState === 'work') {
            timerState = 'break';
            timeRemaining = BREAK_TIME;
            toggleModeBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Work Mode'; // Change button text
            pomodoroContainer.classList.remove('work-mode');
            pomodoroContainer.classList.add('break-mode'); // Apply break mode styling
        } else {
            timerState = 'work';
            timeRemaining = WORK_TIME;
            toggleModeBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Break Mode'; // Change button text
            pomodoroContainer.classList.remove('break-mode');
            pomodoroContainer.classList.add('work-mode'); // Apply work mode styling
        }
        updateTimerDisplay();
        // Re-enable controls after mode switch
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        resetTimerBtn.disabled = false;
        toggleModeBtn.disabled = false;
        setCustomTimeBtn.disabled = false; // Re-enable custom time setting
        saveTimerState(); // Save timer state after mode switch
    }

    /**
     * Plays a simple alarm sound to signal session end.
     * Handles potential errors if sound cannot be played.
     */
    function playAlarm() {
        try {
            alarmSound.play();
        } catch (error) {
            console.error("Error playing alarm sound:", error);
        }
    }

    /**
     * Sets custom work and break times based on user input.
     * Validates input to be positive numbers.
     */
    function setCustomTime() {
        const customWorkMinutes = parseInt(workMinutesInput.value);
        const customBreakMinutes = parseInt(breakMinutesInput.value);

        if (isNaN(customWorkMinutes) || customWorkMinutes <= 0 ||
            isNaN(customBreakMinutes) || customBreakMinutes <= 0) {
            console.error("Invalid custom time input. Please enter positive numbers.");
            // In a real app, you might show a user-friendly error message here
            return;
        }

        WORK_TIME = customWorkMinutes * 60;
        BREAK_TIME = customBreakMinutes * 60;

        // Reset the timer to apply new custom times
        timerState = 'work'; // Always reset to work mode after setting custom times
        resetTimer(); // This will also update timeRemaining and display
        saveCustomTimes(); // Save the new custom times
    }

    /**
     * Saves the current timer state (time remaining, mode, running status)
     * and custom times to Chrome's local storage for persistence.
     */
    function saveTimerState() {
        chrome.storage.local.set({
            timerState: JSON.stringify({
                timeRemaining: timeRemaining,
                timerMode: timerState,
                isRunning: isTimerRunning,
                customWorkTime: WORK_TIME,
                customBreakTime: BREAK_TIME,
                isTimerSectionVisible: isTimerVisible // Save visibility state
            })
        }).catch(error => console.error("Error saving timer state:", error));
    }

    /**
     * Saves only the custom work and break times to Chrome's local storage.
     */
    function saveCustomTimes() {
        chrome.storage.local.set({
            customTimes: JSON.stringify({
                work: WORK_TIME,
                break: BREAK_TIME
            })
        }).catch(error => console.error("Error saving custom times:", error));
    }

    /**
     * Loads the timer state and custom times from Chrome's local storage
     * when the popup opens. Restores the timer to its previous state.
     */
    async function loadTimerState() {
        try {
            const data = await chrome.storage.local.get(['timerState', 'customTimes']);

            // Load custom times first
            if (data.customTimes) {
                const loadedCustomTimes = JSON.parse(data.customTimes);
                WORK_TIME = loadedCustomTimes.work;
                BREAK_TIME = loadedCustomTimes.break;
                workMinutesInput.value = WORK_TIME / 60;
                breakMinutesInput.value = BREAK_TIME / 60;
            }

            // Then load timer state, which might override initial timeRemaining based on loaded custom times
            if (data.timerState) {
                const loadedState = JSON.parse(data.timerState);
                timeRemaining = loadedState.timeRemaining;
                timerState = loadedState.timerMode;
                isTimerRunning = loadedState.isRunning;
                isTimerVisible = loadedState.isTimerSectionVisible || false; // Load visibility state

                // Apply correct mode styling and button text
                if (timerState === 'work') {
                    pomodoroContainer.classList.add('work-mode');
                    toggleModeBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Break Mode';
                } else {
                    pomodoroContainer.classList.add('break-mode');
                    toggleModeBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Work Mode';
                }

                updateTimerDisplay(); // Update display with loaded time

                // Restore timer section visibility
                if (isTimerVisible) {
                    pomodoroContainer.classList.add('timer-visible');
                    pomodoroContainer.classList.remove('timer-hidden');
                    toggleTimerVisibilityBtn.innerHTML = '<i class="fas fa-clock"></i> Hide Pomodoro Timer';
                } else {
                    pomodoroContainer.classList.add('timer-hidden');
                    pomodoroContainer.classList.remove('timer-visible');
                    toggleTimerVisibilityBtn.innerHTML = '<i class="fas fa-clock"></i> Show Pomodoro Timer';
                }


                if (isTimerRunning) {
                    startTimerBtn.disabled = true;
                    pauseTimerBtn.disabled = false;
                    toggleModeBtn.disabled = true;
                    setCustomTimeBtn.disabled = true; // Disable custom time setting while running
                    intervalId = setInterval(() => {
                        timeRemaining--;
                        updateTimerDisplay();
                        if (timeRemaining <= 0) {
                            clearInterval(intervalId);
                            isTimerRunning = false;
                            playAlarm();
                            switchMode();
                            startTimerBtn.disabled = false;
                            pauseTimerBtn.disabled = true;
                            toggleModeBtn.disabled = false;
                            setCustomTimeBtn.disabled = false;
                        }
                        saveTimerState();
                    }, 1000);
                } else {
                    startTimerBtn.disabled = false;
                    pauseTimerBtn.disabled = true;
                }
            } else {
                // If no saved timer state, initialize with default/custom work mode
                pomodoroContainer.classList.add('work-mode');
                timeRemaining = WORK_TIME; // Ensure timeRemaining is set based on loaded/default WORK_TIME
                updateTimerDisplay();
                startTimerBtn.disabled = false;
                pauseTimerBtn.disabled = true;
            }
        } catch (error) {
            console.error("Error loading timer state or custom times:", error);
            // Fallback to default state if loading fails
            WORK_TIME = 25 * 60;
            BREAK_TIME = 5 * 60;
            timeRemaining = WORK_TIME;
            timerState = 'work';
            isTimerRunning = false;
            isTimerVisible = false; // Default to hidden
            pomodoroContainer.classList.add('work-mode');
            pomodoroContainer.classList.add('timer-hidden'); // Ensure it's hidden by default
            updateTimerDisplay();
            startTimerBtn.disabled = false;
            pauseTimerBtn.disabled = true;
            workMinutesInput.value = WORK_TIME / 60;
            breakMinutesInput.value = BREAK_TIME / 60;
            toggleTimerVisibilityBtn.innerHTML = '<i class="fas fa-clock"></i> Show Pomodoro Timer';
        }
    }


    // --- Task Management Functions ---

    /**
     * Generates a unique ID for a new task using timestamp and random string.
     * @returns {string} A unique ID for the task.
     */
    function generateUniqueId() {
        return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Renders all tasks from the `tasks` array into their respective Kanban quadrants.
     * Clears existing tasks before re-rendering to ensure correct order and state.
     */
    function renderTasks() {
        // Clear existing tasks from all quadrant lists to prevent duplicates
        quadrants.forEach(quadrant => {
            const tasksList = quadrant.querySelector('.tasks-list');
            tasksList.innerHTML = '';
        });

        // Iterate through the tasks array and create/append task cards
        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.setAttribute('draggable', 'true'); // Make task cards draggable
            taskCard.id = task.id; // Set the ID for drag-and-drop identification

            const taskContent = document.createElement('span');
            taskContent.textContent = task.content;
            taskCard.appendChild(taskContent);

            // Create and append a delete button for each task
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-task-btn';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>'; // Font Awesome 'x' icon
            deleteBtn.title = 'Delete task';
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent dragstart from firing when clicking delete
                deleteTask(task.id); // Call deleteTask function with the task's ID
            });
            taskCard.appendChild(deleteBtn);

            // Add dragstart listener to each task card for drag-and-drop functionality
            taskCard.addEventListener('dragstart', (e) => {
                draggedTaskId = e.target.id; // Store the ID of the task being dragged
                e.target.classList.add('dragging'); // Add 'dragging' class for visual feedback
                // Set a custom drag image (the task card itself) for better UX
                e.dataTransfer.setDragImage(e.target, e.target.offsetWidth / 2, e.target.offsetHeight / 2);
            });

            // Find the correct quadrant's task list and append the task card
            const targetQuadrantList = document.querySelector(`.quadrant[data-quadrant-id="${task.quadrant}"] .tasks-list`);
            if (targetQuadrantList) {
                targetQuadrantList.appendChild(taskCard);
            } else {
                console.warn(`Quadrant with ID "${task.quadrant}" not found for task "${task.content}".`);
            }
        });
    }

    /**
     * Adds a new task based on the input field content.
     * Defaults to the 'Urgent & Important' quadrant.
     */
    function addTask() {
        const content = newTaskInput.value.trim();
        if (content) { // Only add if content is not empty
            const newTask = {
                id: generateUniqueId(),
                content: content,
                quadrant: 'urgent-important' // Default quadrant for new tasks
            };
            tasks.push(newTask); // Add new task to the array
            saveTasks(); // Save the updated tasks array to storage
            renderTasks(); // Re-render all tasks to display the new one
            newTaskInput.value = ''; // Clear the input field
        }
    }

    /**
     * Deletes a task from the `tasks` array and re-renders the board.
     * @param {string} taskId - The ID of the task to be deleted.
     */
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId); // Filter out the task to be deleted
        saveTasks(); // Save the updated tasks array
        renderTasks(); // Re-render to reflect the deletion
    }

    /**
     * Saves the current `tasks` array to Chrome's local storage.
     * Tasks are stringified to JSON for storage.
     */
    function saveTasks() {
        chrome.storage.local.set({ tasks: JSON.stringify(tasks) })
            .catch(error => console.error("Error saving tasks:", error));
    }

    /**
     * Loads tasks from Chrome's local storage when the popup is opened.
     * Parses the stored JSON string back into an array.
     */
    async function loadTasks() {
        try {
            const data = await chrome.storage.local.get('tasks');
            if (data.tasks) {
                tasks = JSON.parse(data.tasks); // Parse JSON string back to array
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
            tasks = []; // Initialize as empty array if loading fails
        }
        renderTasks(); // Render the loaded tasks
    }

    // --- Drag and Drop Event Handlers for Quadrants ---

    quadrants.forEach(quadrant => {
        // Event fired when a draggable element is dragged over the quadrant
        quadrant.addEventListener('dragover', (e) => {
            e.preventDefault(); // Crucial: Prevents default handling to allow dropping
            // Add visual feedback to the target quadrant
            if (!quadrant.classList.contains('drag-over')) {
                quadrant.classList.add('drag-over');
            }
        });

        // Event fired when a draggable element leaves the quadrant area
        quadrant.addEventListener('dragleave', (e) => {
            // Remove visual feedback when leaving the quadrant
            quadrant.classList.remove('drag-over');
        });

        // Event fired when a draggable element is dropped on the quadrant
        quadrant.addEventListener('drop', (e) => {
            e.preventDefault();
            quadrant.classList.remove('drag-over'); // Remove highlight on drop

            if (draggedTaskId) {
                const targetQuadrantId = quadrant.dataset.quadrantId; // Get the ID of the target quadrant
                const taskIndex = tasks.findIndex(task => task.id === draggedTaskId); // Find the dragged task in the array

                // If task found and its quadrant is different from target, update it
                if (taskIndex > -1 && tasks[taskIndex].quadrant !== targetQuadrantId) {
                    tasks[taskIndex].quadrant = targetQuadrantId; // Update task's quadrant
                    saveTasks(); // Save the updated tasks array
                    renderTasks(); // Re-render to reflect the task's new position
                }
            }
            draggedTaskId = null; // Reset dragged task ID after drop
        });

        // Event fired when a drag operation ends (either by dropping or cancelling)
        quadrant.addEventListener('dragend', (e) => {
            // Clean up 'dragging' class from the original task card
            const draggedElement = document.getElementById(draggedTaskId);
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
            }
            // Ensure all drag-over classes are removed from all quadrants
            quadrants.forEach(q => q.classList.remove('drag-over'));
            draggedTaskId = null; // Reset dragged task ID
        });
    });

    // --- Dark Mode Toggle Functions ---

    /**
     * Toggles the 'dark-mode' class on the body and saves the preference.
     * Updates the toggle button icon accordingly.
     */
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        chrome.storage.local.set({ darkMode: isDarkMode }); // Save preference to local storage
        // Update icon based on the new mode
        darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    /**
     * Loads the dark mode preference from Chrome's local storage
     * and applies it on extension popup load.
     */
    async function loadDarkModePreference() {
        try {
            const result = await chrome.storage.local.get('darkMode');
            if (result.darkMode) { // If darkMode is true in storage
                document.body.classList.add('dark-mode');
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Show sun icon
            } else { // If darkMode is false or not set
                document.body.classList.remove('dark-mode');
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Show moon icon
            }
        } catch (error) {
            console.error("Error loading dark mode preference:", error);
            // Default to light mode if an error occurs during loading
            document.body.classList.remove('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }


    // --- Event Listeners ---
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    toggleModeBtn.addEventListener('click', switchMode);
    setCustomTimeBtn.addEventListener('click', setCustomTime);

    addTaskBtn.addEventListener('click', addTask);
    // Allow adding tasks by pressing Enter in the input field
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Event listener to toggle timer section visibility
    toggleTimerVisibilityBtn.addEventListener('click', () => {
        isTimerVisible = !isTimerVisible;
        if (isTimerVisible) {
            pomodoroContainer.classList.remove('timer-hidden');
            pomodoroContainer.classList.add('timer-visible');
            toggleTimerVisibilityBtn.innerHTML = '<i class="fas fa-clock"></i> Hide Pomodoro Timer';
        } else {
            pomodoroContainer.classList.remove('timer-visible');
            pomodoroContainer.classList.add('timer-hidden');
            toggleTimerVisibilityBtn.innerHTML = '<i class="fas fa-clock"></i> Show Pomodoro Timer';
        }
        saveTimerState(); // Save the new visibility state
    });


    // --- Initialization on DOM Content Loaded ---
    loadTasks(); // Load and render saved tasks
    loadTimerState(); // Load and restore timer state (including visibility)
    loadDarkModePreference();
    pomodoroContainer.classList.add('work-mode'); // Ensure initial work mode styling is applied
});
