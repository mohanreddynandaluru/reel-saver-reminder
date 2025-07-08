document.addEventListener('DOMContentLoaded', function() {
  const authStatus = document.getElementById('auth-status');
  const userInfo = document.getElementById('user-info');
  const loginPrompt = document.getElementById('login-prompt');
  const userEmail = document.getElementById('user-email');
  const notesCount = document.getElementById('notes-count');
  const remindersCount = document.getElementById('reminders-count');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const viewNotesBtn = document.getElementById('view-notes-btn');
  const openInstagramBtn = document.getElementById('open-instagram-btn');

  // Check if all required elements exist
  const requiredElements = {
    authStatus, userInfo, loginPrompt, userEmail, notesCount, 
    remindersCount, loginBtn, logoutBtn, viewNotesBtn, openInstagramBtn
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([name, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error('❌ Missing DOM elements:', missingElements);
    return;
  }

      // ✅ All DOM elements found

  // Check authentication status when popup opens
  checkAuthStatus();

  // Event listeners with null checks
  if (loginBtn) loginBtn.addEventListener('click', openLoginPage);
  if (logoutBtn) logoutBtn.addEventListener('click', signOut);
  if (viewNotesBtn) viewNotesBtn.addEventListener('click', openDashboard);
  if (openInstagramBtn) openInstagramBtn.addEventListener('click', openInstagram);

  function checkAuthStatus() {
    // 🔍 Starting auth status check...
    chrome.storage.local.get(['firebaseToken', 'user', 'userEmail'], function(result) {
              // 🔍 Auth check result: ${result}
      
      if (result.firebaseToken && result.user) {
        // User is authenticated
                  // ✅ User is authenticated
        
        // Extract email from user object or use stored userEmail
        let userEmail = result.userEmail;
        if (!userEmail && result.user && typeof result.user === 'object') {
          userEmail = result.user.email;
          // 📧 Extracted email from user object: ${userEmail}
        }
        
        // 📧 Final user email to display: ${userEmail}
        
        showUserInfo(result.user, userEmail);
        fetchUserStats();
      } else {
        // User is not authenticated
        // ❌ User not authenticated
        showLoginPrompt();
      }
    });
  }

  function showUserInfo(userId, email) {
    if (!authStatus || !userInfo || !loginPrompt) {
      console.error('❌ Required elements not found for showUserInfo');
      return;
    }

    authStatus.style.display = 'none';
    loginPrompt.style.display = 'none';
    userInfo.style.display = 'block';
    
    // Handle different user object formats
    let displayEmail = email;
    
    // If email is not provided, try to extract it from userId object
    if (!displayEmail && userId) {
      if (typeof userId === 'object') {
        // If userId is an object, try to get email from it
        displayEmail = userId.email || userId.userEmail || userId.displayName || 'User';
      } else if (typeof userId === 'string') {
        // If userId is a string, check if it looks like an email
        if (userId.includes('@')) {
          displayEmail = userId;
        } else {
          displayEmail = `User: ${userId}`;
        }
      }
    }
    
    // Ensure we have a valid display value
    if (!displayEmail || displayEmail === 'User') {
      displayEmail = 'User';
    }
    
    // Truncate long emails for better display
    if (displayEmail.length > 30 && displayEmail.includes('@')) {
      const [localPart, domain] = displayEmail.split('@');
      if (localPart.length > 15) {
        displayEmail = `${localPart.substring(0, 15)}...@${domain}`;
      }
    }
    
    if (userEmail) {
      userEmail.textContent = displayEmail;
    }
    
    // Add fade-in animation
    if (userInfo) {
      userInfo.classList.add('fade-in-up');
    }
  }

  function showLoginPrompt() {
    if (!authStatus || !userInfo || !loginPrompt) {
      console.error('❌ Required elements not found for showLoginPrompt');
      return;
    }

    authStatus.style.display = 'none';
    userInfo.style.display = 'none';
    loginPrompt.style.display = 'block';
    
    // Add fade-in animation
    if (loginPrompt) {
      loginPrompt.classList.add('fade-in-up');
    }
  }

  function fetchUserStats() {
    chrome.storage.local.get('firebaseToken', function(result) {
      if (result.firebaseToken && notesCount && remindersCount) {
        fetch('http://localhost:3005/api/notes', {
          headers: {
            'Authorization': `Bearer ${result.firebaseToken}`
          }
        })
        .then(response => response.json())
        .then(notes => {
          // Handle both array and object responses
          if (notes && !Array.isArray(notes) && Array.isArray(notes.notes)) {
            notes = notes.notes;
          }
          if (!Array.isArray(notes)) {
            notes = [];
          }
          const totalNotes = notes.length;
          const activeReminders = notes.filter(note => note.isReminderSet && !note.reminderTriggered).length;

          // Animate the numbers
          animateNumber(notesCount, totalNotes);
          animateNumber(remindersCount, activeReminders);
        })
        .catch(error => {
          console.error('Error fetching user stats:', error);
          if (notesCount) notesCount.textContent = '0';
          if (remindersCount) remindersCount.textContent = '0';
        });
      }
    });
  }

  function animateNumber(element, targetValue) {
    if (!element) return;
    
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    }
    
    requestAnimationFrame(updateNumber);
  }

  function openLoginPage() {
    chrome.runtime.sendMessage({ type: 'OPEN_LOGIN' });
    window.close();
  }

  function signOut() {
    // 🚪 Starting sign out process...
    
    // Show loading state
    if (logoutBtn) {
      logoutBtn.innerHTML = '<span class="loading-spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></span>';
      logoutBtn.disabled = true;
    }
    
    // Send logout message to background script to sign out from Firebase
    chrome.runtime.sendMessage({ type: 'LOGOUT' }, (response) => {
      // Handle response or error
      if (chrome.runtime.lastError) {
        // ⚠️ Logout message error: ${chrome.runtime.lastError.message}
      } else {
        // 🚪 Logout message sent successfully
      }
      
      // Always clear local storage and show login prompt
      chrome.storage.local.remove(['firebaseToken', 'user', 'userEmail', 'lastNoteSaved'], function() {
        // 🚪 Local storage cleared
        showLoginPrompt();
      });
    });
  }

  function openDashboard() {
    // Add loading state to button
    if (viewNotesBtn) {
      viewNotesBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Opening...</span>';
      viewNotesBtn.disabled = true;
    }
    
    // Open the React frontend dashboard
    chrome.tabs.create({
      url: 'http://localhost:3000/login' // React frontend URL
    });
    window.close();
  }

  function openInstagram() {
    // Add loading state to button
    if (openInstagramBtn) {
      openInstagramBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Opening...</span>';
      openInstagramBtn.disabled = true;
    }
    
    chrome.tabs.create({
      url: 'https://www.instagram.com'
    });
    window.close();
  }

  // Add hover effects for better UX
  function addHoverEffects() {
    const buttons = document.querySelectorAll('.action-btn, .logout-btn');
    buttons.forEach(button => {
      if (button) {
        button.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
        });
      }
    });
  }

  // Initialize hover effects
  addHoverEffects();

  // Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.close();
    }
  });

  // Listen for storage changes to update the popup automatically
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    // 🔄 Storage changed: ${changes}
    
    if (namespace === 'local') {
      // Check if user authentication status changed
      if (changes.user || changes.firebaseToken) {
        // 🔄 Auth data changed, rechecking status...
        setTimeout(() => {
          checkAuthStatus();
        }, 100); // Small delay to ensure storage is updated
      }
    }
  });
});
