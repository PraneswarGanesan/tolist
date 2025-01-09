// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Background service worker installed.");
  });
  
  // Listen for the navigation event to trigger the task popup
  chrome.webNavigation.onCompleted.addListener(
    function (details) {
      if (details.frameId === 0) {  // Main frame
        chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          func: askUserForTasks
        });
      }
    },
    { url: [{ hostContains: "https" }] }  // You can customize this URL filter
  );
  
  function askUserForTasks() {
    // Show the popup asking the user for tasks
    const hasTasks = window.confirm("Do you have any tasks for this website?");
    if (hasTasks) {
      alert("Opening your tasks...");
    } else {
      alert("No tasks for this website.");
    }
  }
  