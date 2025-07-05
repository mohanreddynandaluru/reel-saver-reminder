import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from './firebase-bundle.js';

const signupForm = document.getElementById('signup-form');
const signupError = document.getElementById('signup-error');
const signupSuccess = document.getElementById('signup-success');
const toLoginBtn = document.getElementById('to-login');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupError.style.display = 'none';
  signupSuccess.style.display = 'none';

  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!email || !password) {
    signupError.textContent = 'Please enter both email and password.';
    signupError.style.display = 'block';
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    signupSuccess.textContent = 'Account created! You can now log in.';
    signupSuccess.style.display = 'block';
    signupError.style.display = 'none';
    // Close the tab after a short delay
    setTimeout(() => {
      window.close();
    }, 1200);
  } catch (error) {
    signupError.textContent = error.message.replace('Firebase: ', '');
    signupError.style.display = 'block';
    signupSuccess.style.display = 'none';
  }
});

toLoginBtn.addEventListener('click', () => {
  window.location.href = 'firebase-auth.html';
}); 