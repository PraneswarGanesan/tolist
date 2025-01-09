(function () {
    if (document.getElementById("todo-sidebar")) return;
  
    // Inject Bootstrap and Material Icons
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href = "https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css";
    document.head.appendChild(bootstrapLink);
  
    const materialIcons = document.createElement("link");
    materialIcons.rel = "stylesheet";
    materialIcons.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    document.head.appendChild(materialIcons);
  
    // Create Sidebar
    const sidebar = document.createElement("div");
    sidebar.id = "todo-sidebar";
    sidebar.style.position = "fixed";
    sidebar.style.top = "0";
    sidebar.style.right = "0";
    sidebar.style.width = "300px";
    sidebar.style.height = "100%";
    sidebar.style.backgroundColor = "#E8E7AB";
    sidebar.style.borderLeft = "1px solid #ccc";
    sidebar.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.2)";
    sidebar.style.zIndex = "10000";
    sidebar.style.overflowY = "auto";
    sidebar.style.padding = "15px";
    sidebar.style.fontFamily = "'Roboto', sans-serif";
  
    const header = document.createElement("div");
    header.className = "d-flex justify-content-between align-items-center mb-3";
    header.innerHTML = `
      <h4 class="mb-0">To-Do List</h4>
      <span class="material-icons" id="close-sidebar" style="cursor: pointer;">close</span>
    `;
    sidebar.appendChild(header);
  
    // Close Sidebar functionality
    header.querySelector("#close-sidebar").addEventListener("click", () => {
      sidebar.remove();
    });
  
    // Task Input & Reminder Form
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group mb-3";
    inputGroup.innerHTML = `
      <input type="text" id="task-input" class="form-control" placeholder="Enter a task" />
      <div class="input-group-append">
        <button class="btn btn-primary" id="add-task">Add</button>
      </div>
    `;
    sidebar.appendChild(inputGroup);
  
    // Task List
    const taskList = document.createElement("ul");
    taskList.id = "task-list";
    taskList.className = "list-group";
    sidebar.appendChild(taskList);
  
    document.body.appendChild(sidebar);
  
    // Load Tasks from Server
    fetch("http://localhost:3012/tasks")
      .then((response) => response.json())
      .then((tasks) => {
        tasks.forEach((task) => renderTask(task));
      });
  
    // Add Task
    document.getElementById("add-task").addEventListener("click", () => {
      const taskInput = document.getElementById("task-input");
      const taskText = taskInput.value.trim();
      if (taskText) {
        addTask(taskText);
        taskInput.value = "";
      }
    });
  
    // Add Task to Server
    function addTask(taskText) {
      fetch("http://localhost:3012/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskText, reminderTime: "", email: "" }),
      })
        .then((response) => {
          if (response.ok) {
            renderTask({ taskText, reminderTime: "", email: "" });
          }
        });
    }
  
    // Render Task with Reminder Inputs
    function renderTask(taskData) {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.textContent = taskData.taskText;
      li.style.color = "#E82561";
  
      const reminderForm = document.createElement("form");
      reminderForm.className = "mt-2";
      reminderForm.innerHTML = `
        <div class="form-group">
          <label for="reminder-time">Reminder Time:</label>
          <input type="datetime-local" class="form-control" id="reminder-time">
        </div>
        <div class="form-group">
          <label for="reminder-email">Email:</label>
          <input type="email" class="form-control" id="reminder-email" placeholder="Enter email">
        </div>
        <button type="button" class="btn btn-sm btn-info" id="set-reminder">Set Reminder</button>
      `;
  
      reminderForm.querySelector("#set-reminder").addEventListener("click", () => {
        const reminderTime = reminderForm.querySelector("#reminder-time").value;
        const email = reminderForm.querySelector("#reminder-email").value;
        if (reminderTime && email) {
          updateTaskReminder(taskData.taskText, reminderTime, email);
        }
      });
  
      const deleteButton = document.createElement("span");
      deleteButton.className = "material-icons";
      deleteButton.style.cursor = "pointer";
      deleteButton.style.color = "#dc3545";
      deleteButton.textContent = "delete";
      deleteButton.addEventListener("click", () => {
        li.remove();
        removeTask(taskData.taskText);
      });
  
      li.appendChild(reminderForm);
      li.appendChild(deleteButton);
      taskList.appendChild(li);
    }
  
    // Update Task Reminder on Server
    function updateTaskReminder(taskText, reminderTime, email) {
      fetch(`http://localhost:3012/tasks/${taskText}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reminderTime, email }),
      })
        .then((response) => {
          if (response.ok) {
            alert("Reminder set!");
            scheduleReminder(taskText, reminderTime, email);
          }
        });
    }
  
    // Remove Task from Server
    function removeTask(taskText) {
      fetch(`http://localhost:3012/tasks/${taskText}`, {
        method: "DELETE",
      });
    }
  
    // Schedule Notification (for now, just logs)
    function scheduleReminder(taskText, reminderTime, email) {
      const reminderDate = new Date(reminderTime).getTime();
      const currentTime = new Date().getTime();
  
      if (reminderDate > currentTime) {
        setTimeout(() => {
          sendNotification(taskText, email);
        }, reminderDate - currentTime);
      }
    }
  
    // Send Notification to Backend
    function sendNotification(taskText, email) {
      fetch("http://localhost:3012/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          task: taskText,
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("Notification sent.");
          }
        })
        .catch((err) => console.error("Error sending notification", err));
    }
  })();
  