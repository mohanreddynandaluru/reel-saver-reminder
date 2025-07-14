import { auth } from "./firebase-config.js"; // Your Firebase project config
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "./firebase-bundle.js"; // Firebase Auth functions

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
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
  const loadingIndicator = document.getElementById("loading"); // Get the loading div
  const modeIndicator = document.getElementById("modeIndicator"); // Get the mode indicator paragraph

  // Check if all required elements exist
  // This is a robust check to prevent errors if elements are missing
  const elements = {
    loginForm,
    email,
    password,
    loginBtn,
    signupBtn,
    errorMessage,
    toggleMode,
    formTitle,
    formDesc,
    loadingIndicator,
    modeIndicator // Include the new element in the check
  };

  const missingElements = Object.entries(elements)
    .filter(([name, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error("❌ Missing DOM elements. Please check your HTML file:", missingElements);
    console.error("❌ Available elements found:", Object.keys(elements).filter(key => elements[key]));
    return; // Stop execution if critical elements are missing
  }

  let isSignUpMode = false; // Tracks whether the form is in Sign Up or Sign In mode

  // Function to display error messages
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block"; // Make error message visible
  }

  // Function to hide error messages
  function hideError() {
    errorMessage.style.display = "none"; // Hide error message
    errorMessage.textContent = ""; // Clear content
  }

  // Function to manage loading state (buttons disabled, loading indicator shown)
  function setLoading(isLoading) {
    loginBtn.disabled = isLoading; // Disable login button
    signupBtn.disabled = isLoading; // Disable signup button

    // Update button text based on current mode and loading status
    if (isSignUpMode) {
      signupBtn.textContent = isLoading ? "Signing up..." : "Sign Up";
      // In sign-up mode, only signup button is visible and active.
      // loginBtn text won't be seen but we keep it consistent.
      loginBtn.textContent = "Sign In";
    } else {
      loginBtn.textContent = isLoading ? "Signing in..." : "Sign In";
      // In sign-in mode, only login button is visible and active.
      signupBtn.textContent = "Sign Up";
    }

    // Toggle the visibility of the main loading indicator div
    if (loadingIndicator) {
      loadingIndicator.style.display = isLoading ? "block" : "none";
    }
  }

  // Event listener for form submission (handles both login and sign up)
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    hideError(); // Clear any previous errors
    setLoading(true); // Set loading state (disables buttons, shows spinner)

    // Determine whether to sign up or log in based on 'isSignUpMode'
    if (isSignUpMode) {
      // Sign up flow
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value);
        // If successful, onAuthStateChanged will handle the next steps (redirection)
      } catch (err) {
        setLoading(false); // Remove loading state on error
        let errorMsg = "An unexpected error occurred during sign up.";
        switch (err.code) {
          case "auth/email-already-in-use":
            errorMsg = "This email is already in use. Please sign in instead.";
            setSignUpMode(false); // Switch to sign-in mode for convenience
            break;
          case "auth/invalid-email":
            errorMsg = "Please enter a valid email address.";
            break;
          case "auth/weak-password":
            errorMsg = "Password should be at least 6 characters.";
            break;
          case "auth/too-many-requests":
            errorMsg = "Too many attempts. Please try again later.";
            break;
          default:
            errorMsg = err.message; // Fallback to Firebase's default error message
        }
        showError(errorMsg); // Display the user-friendly error message
      }
    } else {
      // Login flow
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        // If successful, onAuthStateChanged will handle the next steps (redirection)
      } catch (err) {
        setLoading(false); // Remove loading state on error
        let errorMsg = "An unexpected error occurred during sign in.";
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
            errorMsg = err.message; // Fallback to Firebase's default error message
        }
        showError(errorMsg); // Display the user-friendly error message
      }
    }
  });

  // Handle toggle mode button
  if (toggleMode) {
    toggleMode.addEventListener("click", () => {
      setSignUpMode(!isSignUpMode); // Toggle between sign-up and sign-in mode
    });
  }

  // Function to update UI based on sign-up or sign-in mode
  function setSignUpMode(signUp) {
    isSignUpMode = signUp;
    if (signUp) {
      formTitle.textContent = "Create Account";
      formDesc.textContent = "Sign up to start saving Instagram posts with notes and reminders";
      
      // Control button visibility
      loginBtn.style.display = "none"; // Hide login button
      signupBtn.style.display = "block"; // Show signup button

      if (toggleMode) {
        toggleMode.textContent = "Already have an account? Sign in";
      }
      if (modeIndicator) {
        modeIndicator.textContent = "Sign Up"; // Update mode indicator text
      }
    } else {
      formTitle.textContent = "Insta Notes";
      formDesc.textContent = "Sign in to save Instagram posts with notes and reminders";

      // Control button visibility
      loginBtn.style.display = "block"; // Show login button
      signupBtn.style.display = "none"; // Hide signup button

      if (toggleMode) {
        toggleMode.textContent = "Don't have an account? Sign up";
      }
      if (modeIndicator) {
        modeIndicator.textContent = "Sign In"; // Update mode indicator text
      }
    }
    hideError(); // Clear error message when switching modes
    setLoading(false); // Ensure loading state is off when mode changes
  }

  // Default to login mode when the page loads
  setSignUpMode(false);

  // Handle authentication state changes (this listener runs whenever user signs in/out)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User signed in
      
      // Store user info in chrome storage (assuming this is a Chrome Extension)
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
      // User signed out
      setLoading(false); // Ensure loading state is off if user signs out
    }
  });

  // Focus on email input when page loads for better UX
  if (email) {
    email.focus();
  }
});
