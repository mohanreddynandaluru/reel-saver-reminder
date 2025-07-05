import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "./firebase-bundle.js";

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // 🔧 DOM loaded, initializing auth form...
  
  // Get all required elements
  const loginForm = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const errorMessage = document.getElementById("errorMessage");
  const toggleMode = document.getElementById("toggleMode");
  const formTitle = document.getElementById("formTitle");
  const formDesc = document.getElementById("formDesc");

  // Check if all elements exist
  const elements = {
    loginForm,
    email,
    password,
    loginBtn,
    signupBtn,
    errorMessage,
    toggleMode,
    formTitle,
    formDesc
  };

  const missingElements = Object.entries(elements)
    .filter(([name, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error("❌ Missing DOM elements:", missingElements);
    console.error("❌ Available elements:", Object.keys(elements).filter(key => elements[key]));
    return;
  }

      // ✅ All DOM elements found successfully

  let isSignUpMode = false;

  // Show error message
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }

  // Hide error message
  function hideError() {
    errorMessage.style.display = "none";
  }

  // Show loading state
  function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    signupBtn.disabled = isLoading;
    loginBtn.textContent = isSignUpMode ? "Sign In" : (isLoading ? "Signing in..." : "Sign In");
    signupBtn.textContent = isSignUpMode ? (isLoading ? "Signing up..." : "Sign Up") : "Sign Up";
  }

  // Handle login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    setLoading(true);

    if (isSignUpMode) {
      // Sign up flow
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value);
        // Success will be handled by onAuthStateChanged
      } catch (err) {
        setLoading(false);
        let errorMsg = "An error occurred during sign up.";
        switch (err.code) {
          case "auth/email-already-in-use":
            errorMsg = "This email is already in use.";
            break;
          case "auth/invalid-email":
            errorMsg = "Please enter a valid email address.";
            break;
          case "auth/weak-password":
            errorMsg = "Password should be at least 6 characters.";
            break;
          default:
            errorMsg = err.message;
        }
        showError(errorMsg);
      }
    } else {
      // Login flow
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        // Success will be handled by onAuthStateChanged
      } catch (err) {
        setLoading(false);
        let errorMsg = "An error occurred during sign in.";
        switch (err.code) {
          case "auth/user-not-found":
            errorMsg = "No account found with this email address.";
            break;
          case "auth/wrong-password":
            errorMsg = "Incorrect password.";
            break;
          case "auth/invalid-email":
            errorMsg = "Please enter a valid email address.";
            break;
          case "auth/too-many-requests":
            errorMsg = "Too many failed attempts. Please try again later.";
            break;
          case "auth/user-disabled":
            errorMsg = "This account has been disabled.";
            break;
          default:
            errorMsg = err.message;
        }
        showError(errorMsg);
      }
    }
  });

  // Handle sign up button (submit form in sign up mode)
  signupBtn.addEventListener("click", (e) => {
    if (!isSignUpMode) {
      // Switch to sign up mode
      setSignUpMode(true);
    } else {
      // Submit the form (sign up)
      loginForm.requestSubmit();
    }
  });

  // Handle toggle mode button
  if (toggleMode) {
    toggleMode.addEventListener("click", () => {
      setSignUpMode(!isSignUpMode);
    });
  }

  function setSignUpMode(signUp) {
    isSignUpMode = signUp;
    if (signUp) {
      formTitle.textContent = "Create Account";
      formDesc.textContent = "Sign up to start saving Instagram posts with notes and reminders";
      loginBtn.style.display = "none";
      signupBtn.style.display = "block";
      if (toggleMode) {
        toggleMode.textContent = "Already have an account? Sign in";
      }
    } else {
      formTitle.textContent = "Insta Notes";
      formDesc.textContent = "Sign in to save Instagram posts with notes and reminders";
      loginBtn.style.display = "block";
      signupBtn.style.display = "block";
      if (toggleMode) {
        toggleMode.textContent = "Don't have an account? Sign up";
      }
    }
    hideError();
    setLoading(false);
  }

  // Default to login mode
  setSignUpMode(false);

  // Handle authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
              // ✅ User signed in: ${user.email}
      
      // Store user info in chrome storage
      chrome.storage.local.set({
        user: {
          uid: user.uid,
          email: user.email
        }
      });
      
      // Notify background script about successful login
      chrome.runtime.sendMessage({ type: "LOGIN_SUCCESS", user: user.uid });
      
      // Close the login window after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
              // ❌ User signed out
      setLoading(false);
    }
  });

  // Focus on email input when page loads
  if (email) {
    email.focus();
  }
  
      // ✅ Auth form initialization complete
});

// Fallback for immediate execution if DOM is already loaded
if (document.readyState === 'loading') {
  // ⏳ DOM still loading, waiting for DOMContentLoaded...
} else {
  // ⚡ DOM already loaded, triggering initialization...
  document.dispatchEvent(new Event('DOMContentLoaded'));
}
