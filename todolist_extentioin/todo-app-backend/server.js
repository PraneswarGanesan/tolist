const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const app = express();
const port = 3012;


const cors = require('cors');

// const allowedOrigins = [
//   'https://leetcode.com', 
//   'https://google.com', 
//   // Add other domains as required
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // Allowing no-origin (e.g., local dev)
//       callback(null, true);
//     } else {
//       callback(new Error('CORS not allowed'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // List allowed methods
//   credentials: true, // Allow credentials if needed
// };

// app.use(cors(corsOptions));
// const corsOptions = {
//     origin: '*', // Allow all origins (only use in development)
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   };
  
//   app.use(cors(corsOptions));
  
const corsOptions = {
    origin: function (origin, callback) {
      if (origin && (origin.startsWith('https://') || origin.startsWith('http://'))) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  };
  
  app.use(cors(corsOptions));
  

// Middleware
app.use(bodyParser.json());

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Loads email from .env
      pass: process.env.EMAIL_PASS,  // Loads password from .env
    },
  });

// Path to the JSON file where tasks will be stored
const tasksFilePath = path.join(__dirname, 'tasks.json');

// Read the tasks from the JSON file
function readTasks() {
  try {
    const data = fs.readFileSync(tasksFilePath);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write tasks to the JSON file
function writeTasks(tasks) {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

// API to send email notifications
app.post("/send-notification", (req, res) => {
  const { email, task } = req.body;

  const mailOptions = {
    from: 'admin@todoapp.com',
    to: email,
    subject: 'Task Reminder',
    text: `Don't forget to complete your task: ${task}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error sending email.");
    }
    console.log("Email sent: " + info.response);
    res.status(200).send("Notification sent.");
  });
});

// API to get all tasks
app.get("/tasks", (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// API to add a new task
app.post("/tasks", (req, res) => {
  const { taskText, reminderTime, email } = req.body;
  const tasks = readTasks();

  const newTask = { taskText, reminderTime, email };
  tasks.push(newTask);

  writeTasks(tasks);
  res.status(201).send("Task added.");
});

// API to remove a task
app.delete("/tasks/:taskText", (req, res) => {
  const { taskText } = req.params;
  const tasks = readTasks();

  const updatedTasks = tasks.filter(task => task.taskText !== taskText);

  writeTasks(updatedTasks);
  res.status(200).send("Task removed.");
});

// API to update a task reminder
app.put("/tasks/:taskText", (req, res) => {
  const { taskText } = req.params;
  const { reminderTime, email } = req.body;
  const tasks = readTasks();

  const updatedTasks = tasks.map(task => {
    if (task.taskText === taskText) {
      task.reminderTime = reminderTime;
      task.email = email;
    }
    return task;
  });

  writeTasks(updatedTasks);
  res.status(200).send("Task updated.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
