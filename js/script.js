(() => {
    "use strict";

    const STORAGE_KEYS = {
        theme: "lifeDashboardTheme",
        userName: "lifeDashboardUserName",
        tasks: "lifeDashboardTasks",
        quickLinks: "lifeDashboardQuickLinks"
    };

    const DEFAULT_TIMER_SECONDS = 25 * 60;

    const greetingText = document.getElementById("greetingText");
    const currentDate = document.getElementById("currentDate");
    const currentTime = document.getElementById("currentTime");

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const nameInput = document.getElementById("nameInput");
    const saveNameButton = document.getElementById("saveNameButton");

    const timerDisplay = document.getElementById("timerDisplay");
    const timerStatus = document.getElementById("timerStatus");
    const startTimerButton = document.getElementById("startTimerButton");
    const stopTimerButton = document.getElementById("stopTimerButton");
    const resetTimerButton = document.getElementById("resetTimerButton");

    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const taskCounter = document.getElementById("taskCounter");
    const taskMessage = document.getElementById("taskMessage");
    const emptyTaskState = document.getElementById("emptyTaskState");

    const linkForm = document.getElementById("linkForm");
    const linkNameInput = document.getElementById("linkNameInput");
    const linkUrlInput = document.getElementById("linkUrlInput");
    const quickLinksList = document.getElementById("quickLinksList");
    const linkCounter = document.getElementById("linkCounter");
    const linkMessage = document.getElementById("linkMessage");
    const emptyLinkState = document.getElementById("emptyLinkState");

    const toast = document.getElementById("toast");

    let tasks = readStorage(STORAGE_KEYS.tasks, []);
    let quickLinks = readStorage(STORAGE_KEYS.quickLinks, []);
    let timerSeconds = DEFAULT_TIMER_SECONDS;
    let timerInterval = null;
    let toastTimeout = null;

    function readStorage(key, fallbackValue) {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : fallbackValue;
        } catch (error) {
            console.error(`Failed to read ${key} from Local Storage:`, error);
            return fallbackValue;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to save ${key} to Local Storage:`, error);
            showToast("Unable to save data in this browser.");
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(toastTimeout);
        toastTimeout = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2400);
    }

    function setFormMessage(element, message = "", type = "") {
        element.textContent = message;
        element.classList.remove("error", "success");

        if (type) {
            element.classList.add(type);
        }
    }

    function getGreeting(hour) {
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }

    function updateDateTime() {
        const now = new Date();
        const savedName = localStorage.getItem(STORAGE_KEYS.userName) || "";

        currentTime.textContent = now.toLocaleTimeString("en-US", {
            hour12: false
        });

        currentDate.textContent = now.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const baseGreeting = getGreeting(now.getHours());
        greetingText.textContent = savedName
            ? `${baseGreeting}, ${savedName}`
            : baseGreeting;
    }

    function initializeName() {
        const savedName = localStorage.getItem(STORAGE_KEYS.userName) || "";
        nameInput.value = savedName;
        updateDateTime();
    }

    function saveName() {
        const name = nameInput.value.trim();

        if (!name) {
            localStorage.removeItem(STORAGE_KEYS.userName);
            updateDateTime();
            showToast("Name removed from greeting.");
            return;
        }

        localStorage.setItem(STORAGE_KEYS.userName, name);
        updateDateTime();
        showToast("Name saved successfully.");
    }

    function applyTheme(theme) {
        const useDarkMode = theme === "dark";
        document.body.classList.toggle("dark-mode", useDarkMode);
        themeIcon.textContent = useDarkMode ? "☀️" : "🌙";
        themeToggle.setAttribute(
            "aria-label",
            useDarkMode ? "Switch to light mode" : "Switch to dark mode"
        );
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
        applyTheme(theme);
    }

    function toggleTheme() {
        const nextTheme = document.body.classList.contains("dark-mode")
            ? "light"
            : "dark";

        localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
        applyTheme(nextTheme);
    }

    function formatTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTimer(timerSeconds);
        document.title = timerInterval
            ? `${formatTimer(timerSeconds)} - Focus Timer`
            : "Life Dashboard";
    }

    function startTimer() {
        if (timerInterval) {
            showToast("The timer is already running.");
            return;
        }

        if (timerSeconds <= 0) {
            timerSeconds = DEFAULT_TIMER_SECONDS;
        }

        timerStatus.textContent = "Focusing";
        timerInterval = window.setInterval(() => {
            timerSeconds -= 1;
            updateTimerDisplay();

            if (timerSeconds <= 0) {
                stopTimer(false);
                timerStatus.textContent = "Completed";
                showToast("Focus session completed. Great work!");
                window.alert("Focus session completed. Great work!");
            }
        }, 1000);
    }

    function stopTimer(showMessage = true) {
        window.clearInterval(timerInterval);
        timerInterval = null;

        if (timerSeconds > 0 && timerSeconds < DEFAULT_TIMER_SECONDS) {
            timerStatus.textContent = "Paused";
        } else if (timerSeconds === DEFAULT_TIMER_SECONDS) {
            timerStatus.textContent = "Ready";
        }

        updateTimerDisplay();

        if (showMessage) {
            showToast("Timer stopped.");
        }
    }

    function resetTimer() {
        stopTimer(false);
        timerSeconds = DEFAULT_TIMER_SECONDS;
        timerStatus.textContent = "Ready";
        updateTimerDisplay();
        showToast("Timer reset to 25 minutes.");
    }

    function createTask(taskText) {
        return {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
    }

    function hasDuplicateTask(taskText, ignoredTaskId = null) {
        const normalizedText = taskText.trim().toLowerCase();

        return tasks.some((task) => {
            return task.id !== ignoredTaskId &&
                task.text.trim().toLowerCase() === normalizedText;
        });
    }

    function saveTasks() {
        writeStorage(STORAGE_KEYS.tasks, tasks);
    }

    function renderTasks() {
        taskList.innerHTML = "";

        tasks.forEach((task) => {
            const listItem = document.createElement("li");
            listItem.className = `task-item${task.completed ? " completed" : ""}`;
            listItem.dataset.taskId = String(task.id);

            const createdDate = new Date(task.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short"
            });

            listItem.innerHTML = `
                <input
                    class="task-checkbox"
                    type="checkbox"
                    aria-label="Mark task as completed"
                    ${task.completed ? "checked" : ""}
                >
                <div class="task-content">
                    <p class="task-text">${escapeHtml(task.text)}</p>
                    <p class="task-meta">Added ${createdDate}</p>
                </div>
                <div class="task-actions">
                    <button class="small-button edit-task-button" type="button">Edit</button>
                    <button class="small-button delete delete-task-button" type="button">Delete</button>
                </div>
            `;

            taskList.appendChild(listItem);
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.completed).length;

        taskCounter.textContent = totalTasks === 0
            ? "0 tasks"
            : `${completedTasks}/${totalTasks} done`;

        emptyTaskState.classList.toggle("hidden", totalTasks > 0);
    }

    function addTask(event) {
        event.preventDefault();

        const taskText = taskInput.value.trim();
        setFormMessage(taskMessage);

        if (!taskText) {
            setFormMessage(taskMessage, "Please enter a task.", "error");
            return;
        }

        if (hasDuplicateTask(taskText)) {
            setFormMessage(
                taskMessage,
                "This task already exists. Duplicate tasks are not allowed.",
                "error"
            );
            return;
        }

        tasks.unshift(createTask(taskText));
        saveTasks();
        renderTasks();

        taskForm.reset();
        setFormMessage(taskMessage, "Task added successfully.", "success");
        taskInput.focus();
    }

    function handleTaskListClick(event) {
        const taskItem = event.target.closest(".task-item");

        if (!taskItem) return;

        const taskId = Number(taskItem.dataset.taskId);
        const task = tasks.find((item) => item.id === taskId);

        if (!task) return;

        if (event.target.classList.contains("edit-task-button")) {
            const updatedText = window.prompt("Edit task:", task.text);

            if (updatedText === null) return;

            const cleanText = updatedText.trim();

            if (!cleanText) {
                showToast("Task cannot be empty.");
                return;
            }

            if (hasDuplicateTask(cleanText, taskId)) {
                showToast("Another task already uses that name.");
                return;
            }

            task.text = cleanText;
            saveTasks();
            renderTasks();
            showToast("Task updated.");
        }

        if (event.target.classList.contains("delete-task-button")) {
            const shouldDelete = window.confirm(`Delete "${task.text}"?`);

            if (!shouldDelete) return;

            tasks = tasks.filter((item) => item.id !== taskId);
            saveTasks();
            renderTasks();
            showToast("Task deleted.");
        }
    }

    function handleTaskCheckbox(event) {
        if (!event.target.classList.contains("task-checkbox")) return;

        const taskItem = event.target.closest(".task-item");
        const taskId = Number(taskItem.dataset.taskId);
        const task = tasks.find((item) => item.id === taskId);

        if (!task) return;

        task.completed = event.target.checked;
        saveTasks();
        renderTasks();
    }

    function normalizeUrl(url) {
        const trimmedUrl = url.trim();

        if (!trimmedUrl) return "";

        if (/^https?:\/\//i.test(trimmedUrl)) {
            return trimmedUrl;
        }

        return `https://${trimmedUrl}`;
    }

    function isValidUrl(url) {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
        } catch {
            return false;
        }
    }

    function saveQuickLinks() {
        writeStorage(STORAGE_KEYS.quickLinks, quickLinks);
    }

    function renderQuickLinks() {
        quickLinksList.innerHTML = "";

        quickLinks.forEach((link) => {
            const linkCard = document.createElement("div");
            linkCard.className = "quick-link-card";
            linkCard.dataset.linkId = String(link.id);

            let hostName = link.url;
            try {
                hostName = new URL(link.url).hostname.replace("www.", "");
            } catch {
                // Keep original URL if parsing fails.
            }

            linkCard.innerHTML = `
                <a
                    class="quick-link-anchor"
                    href="${escapeHtml(link.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHtml(link.name)}
                    <span>${escapeHtml(hostName)}</span>
                </a>
                <button
                    class="link-delete-button"
                    type="button"
                    aria-label="Delete ${escapeHtml(link.name)}"
                >×</button>
            `;

            quickLinksList.appendChild(linkCard);
        });

        linkCounter.textContent = `${quickLinks.length} ${quickLinks.length === 1 ? "link" : "links"}`;
        emptyLinkState.classList.toggle("hidden", quickLinks.length > 0);
    }

    function addQuickLink(event) {
        event.preventDefault();
        setFormMessage(linkMessage);

        const name = linkNameInput.value.trim();
        const url = normalizeUrl(linkUrlInput.value);

        if (!name || !url) {
            setFormMessage(linkMessage, "Please complete the link name and URL.", "error");
            return;
        }

        if (!isValidUrl(url)) {
            setFormMessage(linkMessage, "Please enter a valid website URL.", "error");
            return;
        }

        const duplicateUrl = quickLinks.some(
            (link) => link.url.toLowerCase() === url.toLowerCase()
        );

        if (duplicateUrl) {
            setFormMessage(linkMessage, "This website is already in your quick links.", "error");
            return;
        }

        quickLinks.push({
            id: Date.now(),
            name,
            url
        });

        saveQuickLinks();
        renderQuickLinks();
        linkForm.reset();
        setFormMessage(linkMessage, "Quick link added successfully.", "success");
        linkNameInput.focus();
    }

    function handleQuickLinkClick(event) {
        if (!event.target.classList.contains("link-delete-button")) return;

        const linkCard = event.target.closest(".quick-link-card");
        const linkId = Number(linkCard.dataset.linkId);
        const selectedLink = quickLinks.find((link) => link.id === linkId);

        if (!selectedLink) return;

        const shouldDelete = window.confirm(`Delete the "${selectedLink.name}" quick link?`);

        if (!shouldDelete) return;

        quickLinks = quickLinks.filter((link) => link.id !== linkId);
        saveQuickLinks();
        renderQuickLinks();
        showToast("Quick link deleted.");
    }

    function initializeApp() {
        initializeTheme();
        initializeName();
        updateDateTime();
        updateTimerDisplay();
        renderTasks();
        renderQuickLinks();

        window.setInterval(updateDateTime, 1000);
    }

    themeToggle.addEventListener("click", toggleTheme);
    saveNameButton.addEventListener("click", saveName);
    nameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            saveName();
        }
    });

    startTimerButton.addEventListener("click", startTimer);
    stopTimerButton.addEventListener("click", () => stopTimer(true));
    resetTimerButton.addEventListener("click", resetTimer);

    taskForm.addEventListener("submit", addTask);
    taskList.addEventListener("click", handleTaskListClick);
    taskList.addEventListener("change", handleTaskCheckbox);

    linkForm.addEventListener("submit", addQuickLink);
    quickLinksList.addEventListener("click", handleQuickLinkClick);

    initializeApp();
})();
