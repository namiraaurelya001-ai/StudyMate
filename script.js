js_code = r"""
// ==================================
// STUDYMATE - JAVASCRIPT
// ==================================

// 1. NAVIGASI HALAMAN

const navButtons = document.querySelectorAll("[data-target]");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("pageTitle");

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const target = button.dataset.target;

        pages.forEach(page => page.classList.remove("active"));
        document.getElementById(target).classList.add("active");

        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.toggle("active", link.dataset.target === target);
        });

        const titles = {
            dashboard: "Dashboard",
            tasks: "My Tasks",
            schedule: "Study Schedule",
            focus: "Focus Room",
            notes: "My Notes"
        };

        pageTitle.textContent = titles[target];
    });
});


// 2. SISTEM PENYIMPANAN TUGAS

let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("studymate_tasks")) || [];
    if (!Array.isArray(tasks)) tasks = [];
} catch {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem("studymate_tasks", JSON.stringify(tasks));
}

const taskForm = document.getElementById("taskForm");

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("taskInput").value.trim();
    const subject = document.getElementById("taskSubject").value;
    const date = document.getElementById("taskDate").value;

    if (!title || !date) {
        alert("Lengkapi nama tugas dan tanggal deadline!");
        return;
    }

    tasks.push({
        id: Date.now().toString(),
        title: title,
        subject: subject,
        date: date,
        completed: false
    });

    saveTasks();
    renderTasks();
    taskForm.reset();
});


// 3. MENAMPILKAN TUGAS

function renderTasks() {
    const allTasks = document.getElementById("allTasks");
    const dashboardTasks = document.getElementById("dashboardTasks");

    allTasks.innerHTML = "";
    dashboardTasks.innerHTML = "";

    if (tasks.length === 0) {
        allTasks.innerHTML =
            '<div class="empty-state">Belum ada tugas. Tambahkan tugas pertamamu!</div>';

        dashboardTasks.innerHTML =
            '<div class="empty-state">Belum ada tugas terbaru.</div>';
    }

    tasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item" + (task.completed ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Tandai tugas selesai");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("strong");
        title.textContent = task.title;

        const detail = document.createElement("small");
        detail.textContent = task.subject + " • Deadline: " + task.date;

        info.append(title, detail);

        const remove = document.createElement("button");
        remove.className = "delete-task";
        remove.textContent = "✕";
        remove.setAttribute("aria-label", "Hapus tugas");

        remove.addEventListener("click", () => {
            if (confirm("Yakin ingin menghapus tugas ini?")) {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            }
        });

        item.append(checkbox, info, remove);
        allTasks.appendChild(item);
    });

    // Dashboard hanya menampilkan 4 tugas terbaru
    tasks.slice(-4).reverse().forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item" + (task.completed ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("strong");
        title.textContent = task.title;

        const detail = document.createElement("small");
        detail.textContent = task.subject + " • " + task.date;

        info.append(title, detail);
        item.append(checkbox, info);
        dashboardTasks.appendChild(item);
    });

    updateProgress();
}


// 4. MENGHITUNG PROGRES

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressPercent").textContent = percentage + "%";
    document.getElementById("circlePercent").textContent = percentage + "%";

    document.getElementById("progressCircle").style.background =
        `conic-gradient(var(--primary) ${percentage * 3.6}deg, #eeeefa 0deg)`;

    const message = percentage === 100 && total > 0
        ? "Amazing! All tasks completed!"
        : percentage >= 50
        ? "Great job! Keep going!"
        : "Start completing your tasks!";

    document.getElementById("progressMessage").textContent = message;
}


// 5. TIMER POMODORO

let timeLeft = 25 * 60;
let timerInterval = null;

const timerDisplay = document.getElementById("timerDisplay");
const timerStatus = document.getElementById("timerStatus");

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

document.getElementById("startTimer").addEventListener("click", () => {
    if (timerInterval !== null) return;

    if (timeLeft <= 0) {
        timerStatus.textContent = "Session selesai! Silakan reset.";
        return;
    }

    timerStatus.textContent = "Stay focused. You've got this!";

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerStatus.textContent = "Focus session completed! Great work!";
            alert("Selamat! Sesi fokus 25 menit selesai.");
        }
    }, 1000);
});

document.getElementById("pauseTimer").addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStatus.textContent = "Timer paused.";
});

document.getElementById("resetTimer").addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    timerStatus.textContent = "Ready to focus?";
});


// 6. SISTEM CATATAN

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveStatus = document.getElementById("saveStatus");

try {
    noteTitle.value = localStorage.getItem("studymate_note_title") || "";
    noteContent.value = localStorage.getItem("studymate_note_content") || "";
} catch {
    noteTitle.value = "";
    noteContent.value = "";
}

function saveNotes() {
    localStorage.setItem("studymate_note_title", noteTitle.value);
    localStorage.setItem("studymate_note_content", noteContent.value);

    saveStatus.textContent = "✓ Notes saved successfully!";
}

noteTitle.addEventListener("input", saveNotes);
noteContent.addEventListener("input", saveNotes);

document.getElementById("clearNotes").addEventListener("click", () => {
    if (confirm("Yakin ingin menghapus semua catatan?")) {
        noteTitle.value = "";
        noteContent.value = "";
        saveNotes();
    }
});


// 7. INISIALISASI

renderTasks();
updateTimerDisplay();

console.log("StudyMate berhasil dijalankan!");
"""

with open(project + "/js/script.js", "w", encoding="utf-8") as f:
    f.write(js_code)

print("script.js berhasil dibuat!")
print("Semua file frontend sudah selesai dibuat.")
