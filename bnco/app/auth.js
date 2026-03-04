/* ═══════════════════════════════════════════════════════════
   BNCO — Auth Module
   Login/Register UI, Google Sign-In, session management
   ═══════════════════════════════════════════════════════════ */

import {
  login as apiLogin,
  register as apiRegister,
  googleAuth as apiGoogleAuth,
  getProfile,
  getToken,
  clearTokens,
  getCachedUser,
  setCachedUser,
} from './api.js';

// ── State ─────────────────────────────────────────────────

let currentUser = null;
let authReadyResolve = null;
const authReady = new Promise(resolve => { authReadyResolve = resolve; });

// ── Modal HTML ────────────────────────────────────────────

const AUTH_MODAL_HTML = `
<div class="auth-modal" id="authModal">
  <div class="auth-modal__backdrop" id="authBackdrop"></div>
  <div class="auth-modal__container">
    <div class="auth-modal__card">
      <div class="auth-modal__logo">BNCO</div>
      <p class="auth-modal__tagline">Your Pilates, Gamified.</p>

      <!-- Tab Toggle -->
      <div class="auth-modal__tabs">
        <button class="auth-modal__tab auth-modal__tab--active" data-tab="login" id="authTabLogin">Sign In</button>
        <button class="auth-modal__tab" data-tab="register" id="authTabRegister">Sign Up</button>
        <div class="auth-modal__tab-slider"></div>
      </div>

      <!-- Error Display -->
      <div class="auth-modal__error" id="authError" style="display:none;"></div>

      <!-- Login Form -->
      <form class="auth-modal__form" id="loginForm">
        <div class="auth-modal__field">
          <label class="form-label" for="loginEmail">Email</label>
          <input type="email" class="form-input" id="loginEmail" placeholder="you@example.com" required autocomplete="email" />
        </div>
        <div class="auth-modal__field">
          <label class="form-label" for="loginPassword">Password</label>
          <input type="password" class="form-input" id="loginPassword" placeholder="Your password" required autocomplete="current-password" />
        </div>
        <button type="submit" class="btn btn--primary btn--full" id="loginSubmit">
          <span class="auth-modal__btn-text">Sign In</span>
          <span class="auth-modal__spinner" style="display:none;"></span>
        </button>
      </form>

      <!-- Register Form -->
      <form class="auth-modal__form" id="registerForm" style="display:none;">
        <div class="auth-modal__field">
          <label class="form-label" for="registerName">Display Name</label>
          <input type="text" class="form-input" id="registerName" placeholder="Your name" required autocomplete="name" />
        </div>
        <div class="auth-modal__field">
          <label class="form-label" for="registerEmail">Email</label>
          <input type="email" class="form-input" id="registerEmail" placeholder="you@example.com" required autocomplete="email" />
        </div>
        <div class="auth-modal__field">
          <label class="form-label" for="registerPassword">Password</label>
          <input type="password" class="form-input" id="registerPassword" placeholder="Min. 8 characters" required minlength="8" autocomplete="new-password" />
        </div>
        <button type="submit" class="btn btn--primary btn--full" id="registerSubmit">
          <span class="auth-modal__btn-text">Create Account</span>
          <span class="auth-modal__spinner" style="display:none;"></span>
        </button>
      </form>

      <!-- Divider -->
      <div class="auth-modal__divider">
        <span>or continue with</span>
      </div>

      <!-- Google Sign-In (rendered by GSI renderButton) -->
      <div class="auth-modal__google" id="googleBtnContainer"></div>
    </div>
  </div>
</div>
`;

// ── Inject Modal ──────────────────────────────────────────

function injectAuthModal() {
  if (document.getElementById('authModal')) return;
  document.body.insertAdjacentHTML('beforeend', AUTH_MODAL_HTML);
  bindAuthEvents();
}

// ── Event Bindings ────────────────────────────────────────

function bindAuthEvents() {
  const modal = document.getElementById('authModal');
  const backdrop = document.getElementById('authBackdrop');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('authTabLogin');
  const tabRegister = document.getElementById('authTabRegister');

  // Tab switching
  tabLogin?.addEventListener('click', () => switchAuthTab('login'));
  tabRegister?.addEventListener('click', () => switchAuthTab('register'));

  // Backdrop close
  backdrop?.addEventListener('click', () => {
    hideAuthModal();
  });

  // Login submit
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthError();
    setAuthLoading('loginSubmit', true);

    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    const result = await apiLogin({ email, password });

    setAuthLoading('loginSubmit', false);

    if (result.ok) {
      currentUser = result.data?.user || null;
      hideAuthModal();
      // Landing/app toggle is driven by bnco:auth-success listener in main.js
      window.dispatchEvent(new CustomEvent('bnco:auth-success', {
        detail: { user: currentUser, needsOnboarding: result.data?.needs_onboarding },
      }));
    } else {
      showAuthError(result.message);
    }
  });

  // Register submit
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthError();
    setAuthLoading('registerSubmit', true);

    const display_name = document.getElementById('registerName')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;

    const result = await apiRegister({ email, password, display_name });

    setAuthLoading('registerSubmit', false);

    if (result.ok) {
      currentUser = result.data?.user || null;
      hideAuthModal();
      // Always show onboarding with role selection for new signups
      window.dispatchEvent(new CustomEvent('bnco:auth-success', {
        detail: { user: currentUser, needsOnboarding: true },
      }));
    } else {
      showAuthError(result.message);
    }
  });

  // Initialize Google Sign-In (render button)
  initGoogleSignIn();

  // Listen for auth-required events
  window.addEventListener('bnco:auth-required', () => {
    currentUser = null;
    showAuthModal();
  });
}

// ── Tab Switching ─────────────────────────────────────────

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('authTabLogin');
  const tabRegister = document.getElementById('authTabRegister');
  const slider = document.querySelector('.auth-modal__tab-slider');

  clearAuthError();

  if (tab === 'login') {
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    tabLogin?.classList.add('auth-modal__tab--active');
    tabRegister?.classList.remove('auth-modal__tab--active');
    if (slider) slider.style.transform = 'translateX(0)';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    tabRegister?.classList.add('auth-modal__tab--active');
    tabLogin?.classList.remove('auth-modal__tab--active');
    if (slider) slider.style.transform = 'translateX(100%)';
  }
}

// ── Error Display ─────────────────────────────────────────

function showAuthError(message) {
  const el = document.getElementById('authError');
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

function clearAuthError() {
  const el = document.getElementById('authError');
  if (el) {
    el.textContent = '';
    el.style.display = 'none';
  }
}

// ── Loading State ─────────────────────────────────────────

function setAuthLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const text = btn.querySelector('.auth-modal__btn-text');
  const spinner = btn.querySelector('.auth-modal__spinner');
  if (loading) {
    btn.disabled = true;
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
  } else {
    btn.disabled = false;
    if (text) text.style.display = '';
    if (spinner) spinner.style.display = 'none';
  }
}

// ── Show / Hide Modal ─────────────────────────────────────

export function showAuthModal() {
  injectAuthModal();
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('auth-modal--visible');
    document.body.style.overflow = 'hidden';
  }
}

export function hideAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('auth-modal--visible');
    document.body.style.overflow = '';
  }
}

// ── Google Sign-In ────────────────────────────────────────

let gsiInitialized = false;

const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '912618975610-b36sq6pqjfgkme3j2c99im002jglpb5q.apps.googleusercontent.com';

function initGoogleSignIn() {
  if (!GOOGLE_CLIENT_ID) {
    showAuthError('Google Sign-In is not configured.');
    return;
  }

  // Load GSI script if not already loaded
  if (!document.getElementById('gsi-script')) {
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      renderGoogleButton();
    };
    document.head.appendChild(script);
  } else if (window.google?.accounts) {
    renderGoogleButton();
  }
}

function renderGoogleButton() {
  if (gsiInitialized) return;

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
    auto_select: false,
  });

  const container = document.getElementById('googleBtnContainer');
  if (container) {
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: container.offsetWidth || 320,
      text: 'continue_with',
      shape: 'pill',
    });
  }

  gsiInitialized = true;
}

async function handleGoogleResponse(response) {
  if (!response.credential) {
    showAuthError('Google sign-in was cancelled.');
    return;
  }

  setAuthLoading('googleSignInBtn', true);
  const result = await apiGoogleAuth(response.credential);
  setAuthLoading('googleSignInBtn', false);

  if (result.ok) {
    currentUser = result.data?.user || null;
    hideAuthModal();
    window.dispatchEvent(new CustomEvent('bnco:auth-success', {
      detail: { user: currentUser, needsOnboarding: result.data?.needs_onboarding },
    }));
  } else {
    showAuthError(result.message);
  }
}

// ── Session Management ────────────────────────────────────

/**
 * Check auth state on load. If token exists, verify with server.
 * Returns { authenticated, user, needsOnboarding }.
 */
export async function checkAuthState() {
  const token = getToken();
  if (!token) {
    authReadyResolve({ authenticated: false });
    return { authenticated: false, user: null, needsOnboarding: false };
  }

  // Try to get profile from server
  const result = await getProfile();

  if (result.ok) {
    currentUser = result.data;
    const state = {
      authenticated: true,
      user: currentUser,
      needsOnboarding: result.data?.needs_onboarding || false,
    };
    authReadyResolve(state);
    return state;
  }

  // Token invalid
  clearTokens();
  authReadyResolve({ authenticated: false });
  return { authenticated: false, user: null, needsOnboarding: false };
}

/**
 * Get the currently authenticated user.
 */
export function getCurrentUser() {
  return currentUser || getCachedUser();
}

/**
 * Check if user is logged in (has a token).
 */
export function isLoggedIn() {
  return !!getToken();
}

/**
 * Log out - clear tokens and reload.
 */
export function logout() {
  currentUser = null;
  clearTokens();
  window.dispatchEvent(new CustomEvent('bnco:auth-required'));
}

/**
 * Wait for auth check to complete.
 */
export function waitForAuth() {
  return authReady;
}
