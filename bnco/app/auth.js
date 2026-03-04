/* ═══════════════════════════════════════════════════════════
   BNCO Health — Auth Module
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
      <div class="auth-modal__logo">BNCO<span>Health</span></div>
      <p class="auth-modal__tagline">Turn every rep into a competition.</p>

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

      <!-- Google Sign-In -->
      <div class="auth-modal__google" id="googleBtnContainer">
        <button type="button" class="auth-modal__google-btn" id="googleSignInBtn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          <span>Google</span>
        </button>
      </div>
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
  const googleBtn = document.getElementById('googleSignInBtn');

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
      // Landing/app toggle is driven by bnco:auth-success listener in main.js
      window.dispatchEvent(new CustomEvent('bnco:auth-success', {
        detail: { user: currentUser, needsOnboarding: true },
      }));
    } else {
      showAuthError(result.message);
    }
  });

  // Google Sign-In
  googleBtn?.addEventListener('click', () => {
    initGoogleSignIn();
  });

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

function initGoogleSignIn() {
  const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    showAuthError('Google Sign-In is not configured.');
    return;
  }

  if (gsiInitialized && window.google?.accounts) {
    window.google.accounts.id.prompt();
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
      setupGSI(clientId);
    };
    document.head.appendChild(script);
  } else if (window.google?.accounts) {
    setupGSI(clientId);
  }
}

function setupGSI(clientId) {
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleResponse,
    auto_select: false,
  });
  gsiInitialized = true;
  window.google.accounts.id.prompt();
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
