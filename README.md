# FocusBoard Extension

**Slogan:** Simplify your tasks, amplify your focus.

## Overview

FocusBoard is a minimalist Chrome Extension meticulously designed to enhance your productivity and focus. It intelligently combines the strategic task prioritization of an **Eisenhower Matrix Kanban board** with the time management discipline of a **customizable Pomodoro timer**. This extension provides a clean, intuitive, and aesthetically pleasing interface, helping you streamline your workflow directly within your browser.

## Features

* **Eisenhower Matrix Kanban Board:**
    * **Intuitive 2x2 Quadrants:** Categorize tasks into "Urgent & Important," "Not Urgent but Important," "Urgent but Not Important," and "Not Urgent & Not Important."
    * **Seamless Drag-and-Drop:** Effortlessly move tasks between quadrants with smooth CSS animations for a fluid user experience.
    * **Dynamic Visual Feedback:** Target quadrants blur, and their labels become bolder and slightly scaled up when a task is dragged over them, clearly indicating the drop zone.
    * **Efficient Task Management:** Quickly add new tasks and remove completed or irrelevant ones.
* **Integrated Pomodoro Timer:**
    * **Customizable Durations:** Set personalized work and break intervals to suit your focus needs.
    * **Comprehensive Controls:** Full control with Start, Pause, and Reset functionalities.
    * **Mode Switching:** Easily toggle between work and break sessions.
    * **Auditory Alerts:** A subtle sound notification signals the end of each session.
    * **Toggleable Display:** The timer section can be shown or hidden with a smooth vertical slide-in/out animation, providing a clutter-free interface when not in use.
* **Persistent Data Storage:**
    * All your tasks (content and assigned quadrant) and custom Pomodoro timer settings are automatically saved using `chrome.storage.local`, ensuring your progress is retained across browser sessions.
* **Apple-Inspired UI/UX:**
    * **Clean Aesthetic:** Features a minimalist design with white cards, light gray backgrounds, and distinct accent colors.
    * **Legible Typography:** Utilizes SF Pro Display (or a clean system fallback) for optimal readability.
    * **Refined Visuals:** Incorporates subtle shadows, rounded corners, and thoughtful spacing for an elegant and modern feel.
    * **Adaptive Dark Mode:** A convenient toggle allows users to switch between light and dark themes, enhancing comfort in various lighting conditions.
* **Manifest V3 Compliant:** Built adhering to the latest Chrome Extension platform standards for enhanced security and performance.

## Installation (Local Development)

To set up and run FocusBoard on your local machine:

1.  **Clone the Repository:**

    ```
    git clone [https://github.com/Prateek5525/FocusBoard.git](https://github.com/Prateek5525/FocusBoard.git)
    cd FocusBoard
    ```

2.  **Open Chrome Extensions:**

    * Navigate to `chrome://extensions/` in your Chrome browser.

3.  **Enable Developer Mode:**

    * Toggle on the "Developer mode" switch located in the top-right corner.

4.  **Load Unpacked Extension:**

    * Click the "Load unpacked" button.

5.  **Select Project Folder:**

    * Browse to and select the `FocusBoard` folder (the one containing `manifest.json`).

6.  **Pin Extension (Optional):**

    * Click the puzzle piece icon (Extensions icon) in your Chrome toolbar, find "FocusBoard," and click the pin icon to keep it easily accessible.

## Usage

1.  Click the FocusBoard icon in your Chrome toolbar.

2.  **Add Tasks:** Type your task into the input field and press `Enter` or click "Add Task."

3.  **Prioritize:** Drag and drop tasks between the four Eisenhower Matrix quadrants to organize your priorities.

4.  **Toggle Timer:** Click the "Show/Hide Pomodoro Timer" button to reveal or conceal the timer section.

5.  **Customize Timer:** Input your desired work and break minutes in the "Custom Durations" section and click "Set Custom Time."

6.  **Manage Timer:** Use the "Start," "Pause," and "Reset" buttons to control your focus sessions. Toggle between work and break modes with the "Break Mode" / "Work Mode" button.

7.  **Dark Mode:** Click the moon/sun icon at the top right to switch between light and dark themes.

## Project Directory Structure
FocusBoard/
├── manifest.json         # Extension manifest (permissions, details)
├── popup.html            # Main HTML for the extension's popup UI (Kanban + Toggleable Timer)
├── popup.js              # JavaScript logic for Kanban board, Pomodoro timer, and UI interactions
├── style.css             # Shared CSS for all UI elements and animations
├── icons/                # Folder containing extension icons (16x16, 48x48, 128x128)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── sounds/               # Folder for audio alerts
│   └── alarm.mp3         # Pomodoro timer alarm sound
└── .gitignore            # Specifies intentionally untracked files to ignore by Git

## Contributing
Contributions are welcome! If you have suggestions for improvements or new features, please feel free to:

1.  Fork the repository.

2.  Create a new branch (`git checkout -b feature/YourFeatureName`).

3.  Make your changes.

4.  Commit your changes (`git commit -m 'Add new feature'`).

5.  Push to your branch (`git push origin feature/YourFeatureName`).

6.  Open a Pull Request.

## License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
