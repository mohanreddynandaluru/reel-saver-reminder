import { auth } from './firebase-config.js';
import {
  onAuthStateChanged,
  getIdToken
} from './firebase-bundle.js';

// 🔧 Background script loaded

// Handle authentication state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const token = await getIdToken(user);
      // Store full user object with email, not just UID
      chrome.storage.local.set({ 
        firebaseToken: token, 
        user: {
          uid: user.uid,
          email: user.email
        }
      });
      // ✅ User authenticated, token saved, email: ${user.email}
    } catch (error) {
      console.error("❌ Error getting token:", error);
    }
  } else {
    chrome.storage.local.remove(["firebaseToken", "user"]);
    // ❌ User signed out, token removed
  }
});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 📨 Received message: ${message.type}
  
  if (message.type === "CHECK_AUTH") {
    chrome.storage.local.get("firebaseToken", ({ firebaseToken }) => {
      if (firebaseToken) {
        // ✅ Auth check: User is authenticated
        sendResponse({ isAuthenticated: true, token: firebaseToken });
      } else {
        // ❌ Auth check: User is not authenticated
        sendResponse({ isAuthenticated: false });
      }
    });
    return true; // Required for async sendResponse
  }
  
  if (message.type === "OPEN_LOGIN") {
    // 🔐 Opening login page
    chrome.tabs.create({
      url: chrome.runtime.getURL("firebase-auth.html"),
      active: true
    });
  }
  
  if (message.type === "OPEN_DASHBOARD") {
    // 📊 Opening React dashboard
    chrome.tabs.create({
      url: "http://localhost:3000",
      active: true
    });
  }
  
  if (message.type === "LOGIN_SUCCESS") {
    // ✅ Login success, closing login tab
    // Close the login tab and notify content script with error handling
    // chrome.tabs.query({ url: chrome.runtime.getURL("firebase-auth.html") }, (tabs) => {
    //   tabs.forEach(tab => {
    //     chrome.tabs.remove(tab.id, () => {
    //       if (chrome.runtime.lastError) {
    //         // ⚠️ Tab already closed or doesn't exist: ${chrome.runtime.lastError.message}
    //       }
    //     });
    //   });
    // });
    
    // Notify all Instagram tabs about successful login with error handling
    chrome.tabs.query({ url: "*://*.instagram.com/*" }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: "LOGIN_SUCCESS" }, (response) => {
          if (chrome.runtime.lastError) {
            // ⚠️ Could not send message to tab: ${chrome.runtime.lastError.message}
          }
        });
      });
    });
  }
  
  if (message.type === "SAVE_NOTE") {
    // 💾 Saving note to backend: ${message.data}
    saveNoteToBackend(message.data);
    // Send response back to content script
    sendResponse({ success: true, message: "Note save request received" });
  }
  
  if (message.type === "SET_REMINDER") {
    // ⏰ Setting reminder: ${message.data}
    setReminder(message.data);
  }
  
  if (message.type === "LOGOUT") {
    // 🚪 User requested logout
    // Sign out from Firebase
    auth.signOut().then(() => {
      // ✅ Firebase sign out successful
      // Storage will be cleared by onAuthStateChanged
    }).catch((error) => {
      console.error("❌ Firebase sign out error:", error);
      // Still clear storage even if Firebase sign out fails
      chrome.storage.local.remove(["firebaseToken", "user", "userEmail", "lastNoteSaved"]);
    });
  }
  
  if (message.type === "UPDATE_NOTE") {
    updateNoteInBackend(message.data).then(result => {
      // Clear any old reminder for this note
      chrome.alarms.clear(`reminder_${message.data.id}`);
      // Check if reminder is in the future and set it
      const reminderTime = new Date(message.data.reminder).getTime();
      if (reminderTime > Date.now()) {
        setReminder({
          note: message.data.note,
          url: message.data.url,
          reminderTime: message.data.reminder,
          noteId: message.data.id
        });
      }
      sendResponse({ success: true, message: "Note updated and reminder scheduled if in future." });
    }).catch(err => {
      sendResponse({ success: false, message: "Failed to update note." });
    });
    return true; // for async sendResponse
  }
});

// Save note to backend
async function saveNoteToBackend(noteData) {
  // 🚀 Starting saveNoteToBackend with data: ${noteData}
  
  try {
    const { firebaseToken, user } = await chrome.storage.local.get(["firebaseToken", "user"]);
    // 🔑 Got Firebase token: ${firebaseToken ? "Present" : "Missing"}
    
    if (!firebaseToken) {
      console.error("❌ No Firebase token available");
      return;
    }
    
    // Add user email to note data if available
    if (user && user.email) {
      noteData.userEmail = user.email;
      // 📧 Adding user email to note: ${user.email}
    }
    
    // 📤 Sending POST request to http://localhost:3005/api/notes
    const response = await fetch("http://localhost:3005/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseToken}`,
      },
      body: JSON.stringify(noteData),
    });
    
    // 📥 Response status: ${response.status}
    const result = await response.json();
    // 📥 Response body: ${result}
    
    if (response.ok) {
      // ✅ Note saved successfully: ${result}
      
      // Show success notification with default icon
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        title: 'Insta Notes',
        message: 'Note saved successfully!',
        buttons: [
          { title: 'View Dashboard' }
        ]
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Success notification error:", chrome.runtime.lastError);
        } else {
          // ✅ Success notification created with ID: ${notificationId}
        }
      });
      
      // If reminder is set, schedule it
      if (noteData.reminder) {
        setReminder({
          note: noteData.note,
          url: noteData.url,
          reminderTime: noteData.reminder,
          noteId: result.noteId || Date.now().toString()
        });
      }
    } else {
      console.error("❌ Failed to save note. Status:", response.status);
      console.error("❌ Error details:", JSON.stringify(result, null, 2));
      console.error("❌ Error message:", result.message || "Unknown error");
      
      // Show error notification with default icon
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        title: 'Insta Notes Error',
        message: 'Failed to save note. Please try again.',
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Error notification error:", chrome.runtime.lastError);
        } else {
          // ✅ Error notification created with ID: ${notificationId}
        }
      });
    }
  } catch (error) {
    console.error("❌ Network error saving note:", error.message);
    console.error("❌ Full error:", error);
    
    // Show error notification with default icon
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      title: 'Insta Notes Error',
      message: 'Network error. Please check your connection.',
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Network error notification error:", chrome.runtime.lastError);
              } else {
          // ✅ Network error notification created with ID: ${notificationId}
        }
    });
  }
}

// Map to store notificationId to post URL
const notificationPostUrlMap = {};

// Update setReminder to store the post URL when creating the notification
function setReminder(reminderData) {
  const reminderTime = new Date(reminderData.reminderTime).getTime();
  const now = Date.now();
  
  if (reminderTime > now) {
    const delayInMinutes = (reminderTime - now) / (1000 * 60);
    
    chrome.alarms.create(`reminder_${reminderData.noteId}`, {
      when: reminderTime
    });
    
    // Store reminder data
    chrome.storage.local.set({
      [`reminder_${reminderData.noteId}`]: reminderData
    });
    
    // ⏰ Reminder set for ${new Date(reminderTime).toLocaleString()}
  }
}

// Handle alarm triggers (reminders)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('reminder_')) {
    const noteId = alarm.name.replace('reminder_', '');
    const reminderData = await chrome.storage.local.get(`reminder_${noteId}`);
    if (reminderData[`reminder_${noteId}`]) {
      const data = reminderData[`reminder_${noteId}`];
      // ⏰ Showing reminder notification: ${data}
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        title: 'Instagram Note Reminder',
        message: data.note || 'You have a saved Instagram post to check!',
        buttons: [
          { title: 'View Post' }
        ]
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Reminder notification error:", chrome.runtime.lastError);
        } else {
          // Store the post URL for this notification
          if (data.url) {
            notificationPostUrlMap[notificationId] = data.url;
          }
        }
      });
      // Clean up
      chrome.storage.local.remove(`reminder_${noteId}`);
      chrome.alarms.clear(alarm.name);
    }
  }
});

// Handle notification clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) { // "View Post" or "View Dashboard" button
    // Directly use the notificationId to look up the URL
    const postUrl = notificationPostUrlMap[notificationId];
    if (postUrl) {
      chrome.tabs.create({ url: postUrl });
      delete notificationPostUrlMap[notificationId];
      return;
    }
    // Fallback: open Instagram home if URL not found
    chrome.tabs.create({ url: 'https://www.instagram.com' });
  }
});

// Add this function after saveNoteToBackend
async function updateNoteInBackend(noteData) {
  const { firebaseToken, user } = await chrome.storage.local.get(["firebaseToken", "user"]);
  if (!firebaseToken) throw new Error("No Firebase token available");

  if (user && user.email) {
    noteData.userEmail = user.email;
  }

  // Use PUT for updating
  const response = await fetch(`http://localhost:3005/api/notes/${noteData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify(noteData),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to update note");
  return result;
}
