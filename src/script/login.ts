// src/scripts/login.js
import { processLogin } from '../lib/auth.js';
import { displayMessage } from '../lib/util.js';

/**
 * Handle login form submission
 */
async function handleLoginSubmit(event:Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('remember-me') === 'on';

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing in...';

    try {
        const result = await processLogin(email, password, rememberMe);
        
        if (result.success) {
            displayMessage(result.message, false);
            window.location.href = '/';
        } else {
            displayMessage(result.message, true);
        }
    } catch (error) {
        displayMessage('An unexpected error occurred. Please try again.', true);
        console.error('Login error:', error);
    } finally {
        submitButton.textContent = originalText;
    }
}

export function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

document.addEventListener('DOMContentLoaded', initLoginForm);