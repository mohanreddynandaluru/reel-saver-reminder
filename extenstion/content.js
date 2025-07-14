// content.js

// Global flag to prevent multiple initializations
let isInitialized = false;

// Initialize the content script only once
function initializeContentScript() {
  if (isInitialized) {
    // ⚠️ Content script already initialized, skipping...
    return;
  }
  
  // 🔧 Initializing Insta Notes content script...
  isInitialized = true;

  // Listen for save button clicks on Instagram
  document.addEventListener("click", function (e) {
    // Enhanced save button detection
    const saveIcon = e.target.closest('svg[aria-label="Save"]') || 
                    e.target.closest('svg[aria-label="Saved"]') ||
                    e.target.closest('[data-testid="save-button"]') ||
                    e.target.closest('button[aria-label*="Save"]') ||
                    e.target.closest('button[aria-label*="Saved"]');
    
    if (!saveIcon) {
      // Debug: log what was clicked
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
        // 🔍 Button clicked: ${button.ariaLabel || button.getAttribute('aria-label') || 'No aria-label'}
      }
      return;
    }

    // 💾 Save button detected: ${saveIcon.ariaLabel || saveIcon.getAttribute('aria-label')}

    // Prevent multiple modals
    if (document.getElementById("instasaver-modal")) {
      // ⚠️ Modal already exists, ignoring click
      return;
    }

    // Prevent the default Instagram save behavior temporarily
    e.preventDefault();
    e.stopPropagation();

    // 💾 Save button clicked, checking authentication...

    // Check authentication status
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: "CHECK_AUTH" }, (response) => {
        if (response && response.isAuthenticated) {
          // User is authenticated, show the note modal
          // ✅ User authenticated, showing note modal
          showNoteModal();
        } else {
          // User is not authenticated, open login page
          // ❌ User not authenticated, opening login page
          chrome.runtime.sendMessage({ type: "OPEN_LOGIN" });
        }
      });
    } else {
      // ⚠️ Chrome runtime not available
    }
  });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 📨 Content script received message: ${message.type}
    
    if (message.type === "LOGIN_SUCCESS") {
      // ✅ Login success message received
      // Optionally refresh the page or show a success message
      showLoginSuccessMessage();
    }
  });

  // Add keyboard shortcut for manual testing (Ctrl+Shift+S)
  document.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      // ⌨️ Manual trigger: Ctrl+Shift+S pressed
      
      // Check authentication status
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: "CHECK_AUTH" }, (response) => {
          if (response && response.isAuthenticated) {
            // ✅ User authenticated, showing note modal (manual trigger)
            showNoteModal();
          } else {
            // ❌ User not authenticated, opening login page (manual trigger)
            chrome.runtime.sendMessage({ type: "OPEN_LOGIN" });
          }
        });
      }
    }
  });
}

// Show login success message
function showLoginSuccessMessage() {
  // Remove any existing success message
  const existingMessage = document.getElementById('login-success-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const message = document.createElement('div');
  message.id = 'login-success-message';
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `;
  message.textContent = '✅ Successfully logged in! You can now save notes.';
  
  document.body.appendChild(message);
  
  // Remove message after 3 seconds
  setTimeout(() => {
    if (message.parentNode) {
      message.remove();
    }
  }, 3000);
}

function showNoteModal() {
  // Prevent multiple modals
  const existingModal = document.getElementById("instasaver-modal");
  if (existingModal) {
    // ⚠️ Modal already exists, removing old one
    existingModal.remove();
  }

  // 📝 Creating note modal...

  // Create modal overlay
  const modal = document.createElement("div");
  modal.id = "instasaver-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 400px;
    max-width: 90vw;
    position: relative;
  `;

  modalContent.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #262626; font-size: 24px; font-weight: 600;">📝 Save with Note</h2>
      <p style="margin: 8px 0 0 0; color: #8e8e8e; font-size: 14px;">Add a note and reminder to this post</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label for="note-input" style="display: block; margin-bottom: 8px; color: #262626; font-weight: 500; font-size: 14px;">
        Note (optional)
      </label>
      <textarea 
        id="note-input" 
        placeholder="Why did you save this post?"
        style="
          width: 100%;
          padding: 12px;
          border: 1px solid #dbdbdb;
          border-radius: 8px;
          color:black;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
          box-sizing: border-box;
        "
      ></textarea>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label for="reminder" style="display: block; margin-bottom: 8px; color:rgb(0, 0, 0); font-weight: 500; font-size: 14px;">
        Reminder (optional)
      </label>
      <input 
        type="datetime-local" 
        id="reminder"
        style="
          width: 100%;
          padding: 12px;
          border: 1px solid #dbdbdb;
          border-radius: 8px;
          font-size: 14px;
          color:black;
          box-sizing: border-box;
        "
      />
    </div>
    
    <div style="margin-bottom: 25px;">
      <label style="display: flex; align-items: center; color: #262626; font-weight: 500; font-size: 14px; cursor: pointer;">
        <input 
          type="checkbox" 
          id="email-notification"
          style="margin-right: 8px; transform: scale(1.2);"
        />
        📧 Send email notification when reminder is due
      </label>
    </div>
    
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button 
        id="cancel-btn"
        style="
          padding: 10px 20px;
          border: 1px solid #dbdbdb;
          background: white;
          color: #262626;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        "
      >
        Cancel
      </button>
      <button 
        id="save-note-btn"
        style="
          padding: 10px 20px;
          border: none;
          background: #0095f6;
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        "
      >
        Save Note
      </button>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Prevent event propagation on modal content
  modalContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Add hover effects
  const saveBtn = document.getElementById("save-note-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  
  saveBtn.addEventListener("mouseenter", () => {
    saveBtn.style.background = "#0081d6";
  });
  saveBtn.addEventListener("mouseleave", () => {
    saveBtn.style.background = "#0095f6";
  });
  
  cancelBtn.addEventListener("mouseenter", () => {
    cancelBtn.style.background = "#fafafa";
  });
  cancelBtn.addEventListener("mouseleave", () => {
    cancelBtn.style.background = "white";
  });

  // Save button handler with proper event handling
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 💾 Save button clicked
    
    const note = document.getElementById("note-input").value.trim();
    const reminderInput = document.getElementById("reminder").value;
    // Convert local datetime to UTC ISO string
    const reminder = reminderInput ? new Date(reminderInput).toISOString() : null;
    const emailNotification = document.getElementById("email-notification").checked;
    const postUrl = window.location.href;

    // Get post details
    const postDetails = getPostDetails();

    const noteData = {
      note: note || "",
      reminder: reminder,
      url: postUrl,
      postDetails: postDetails,
      emailNotification: emailNotification
    };

    // Show debug log
    // 📤 Sending SAVE_NOTE message to background: ${noteData}

    // Send to background script to save
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: "SAVE_NOTE",
        data: noteData
      }, (response) => {
        // 📥 Save response: ${response}
      });
    }

    // Show success message
    showSuccessMessage();
    modal.remove();
  });

  // Cancel button handler with proper event handling
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // ❌ Cancel button clicked
    modal.remove();
  });

  // Close modal when clicking outside (but not on content)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      // 🔄 Clicked outside modal, closing...
      modal.remove();
    }
  });

  // Prevent closing on escape key for now (optional)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("instasaver-modal")) {
      e.preventDefault();
      // 🔄 Escape key pressed, closing modal...
      modal.remove();
    }
  });

  // Focus on note input
  setTimeout(() => {
    const noteInput = document.getElementById("note-input");
    if (noteInput) {
      noteInput.focus();
    }
  }, 100);

  // ✅ Modal created and event listeners attached
}

function getPostDetails() {
  // Try to extract post details from Instagram
  const details = {
    type: "unknown",
    caption: "",
    author: ""
  };

  try {
    // Try to get caption
    const captionElement = document.querySelector('h1[dir="auto"], div[data-testid="post-caption"]');
    if (captionElement) {
      details.caption = captionElement.textContent || "";
    }

    // Try to get author
    const authorElement = document.querySelector('a[role="link"] span, h2 a');
    if (authorElement) {
      details.author = authorElement.textContent || "";
    }

    // Determine post type
    if (window.location.pathname.includes('/reel/')) {
      details.type = "reel";
    } else if (window.location.pathname.includes('/p/')) {
      details.type = "post";
    } else if (window.location.pathname.includes('/tv/')) {
      details.type = "igtv";
    }
  } catch (error) {
    // Could not extract post details: ${error}
  }

  return details;
}

function showSuccessMessage() {
  // Create a temporary success message
  const successMsg = document.createElement("div");
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #00c851;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
  `;
  
  successMsg.innerHTML = `
    <span style="margin-right: 8px;">✅</span>
    Note saved successfully!
  `;

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(successMsg);

  // Remove after 3 seconds
  setTimeout(() => {
    successMsg.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => {
      successMsg.remove();
      style.remove();
    }, 300);
  }, 3000);
}

// Initialize the content script when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  // DOM is already loaded
  initializeContentScript();
}

// Also initialize on navigation (for SPA behavior)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // 🔄 URL changed, reinitializing content script...
    isInitialized = false; // Reset flag to allow reinitialization
    setTimeout(initializeContentScript, 1000); // Small delay to ensure page is loaded
  }
}).observe(document, { subtree: true, childList: true });
