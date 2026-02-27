/**
 * ClawOps Auth Module
 * Firebase Authentication with Google Sign-In + Email/Password
 * Include this script on any page that needs auth.
 *
 * Dependencies (load before this script):
 *   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
 */

(function () {
  'use strict';

  // Firebase config
  // authDomain must be firebaseapp.com for popup auth to work on GitHub Pages
  // The Google consent screen shows "ClawOps" branding (configured in GCP)
  const firebaseConfig = {
    apiKey: "AIzaSyATPkQPGHJ6Mk0aQ4FDnKGIy9yBPhclaAM",
    authDomain: "clawops-488220.firebaseapp.com",
    projectId: "clawops-488220",
    storageBucket: "clawops-488220.firebasestorage.app",
    messagingSenderId: "912618975610",
    appId: "1:912618975610:web:4632491fd69cc52669e6c3"
  };

  // Initialize Firebase (only once)
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();
  const googleProvider = new firebase.auth.GoogleAuthProvider();

  // Plan limits
  const PLAN_LIMITS = {
    free: 1,
    starter: 10,
    pro: 999999,
    enterprise: 999999
  };

  // ── Firestore User Profile ──

  async function ensureUserProfile(user) {
    const ref = db.collection('users').doc(user.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      // Check for pending subscription (purchased before sign-up)
      let pendingPlan = null;
      try {
        const pendingRef = db.collection('pending_subscriptions').doc((user.email || '').toLowerCase());
        const pendingSnap = await pendingRef.get();
        if (pendingSnap.exists) {
          pendingPlan = pendingSnap.data();
          await pendingRef.delete();
        }
      } catch (e) {
        console.warn('Could not check pending subscriptions:', e);
      }

      await ref.set({
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        plan: pendingPlan ? pendingPlan.plan : 'free',
        scansUsed: 0,
        scansLimit: pendingPlan ? pendingPlan.scansLimit : PLAN_LIMITS.free,
        stripeCustomerId: pendingPlan ? pendingPlan.stripeCustomerId : null,
        stripeSubscriptionId: pendingPlan ? pendingPlan.stripeSubscriptionId : null,
        subscriptionStatus: pendingPlan ? 'active' : null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      await ref.update({
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName || snap.data().displayName || '',
        photoURL: user.photoURL || snap.data().photoURL || ''
      });
    }
    return (await ref.get()).data();
  }

  async function getUserProfile(uid) {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? snap.data() : null;
  }

  async function incrementScanCount(uid) {
    const ref = db.collection('users').doc(uid);
    await ref.update({
      scansUsed: firebase.firestore.FieldValue.increment(1)
    });
    return (await ref.get()).data();
  }

  async function canScan(uid) {
    const profile = await getUserProfile(uid);
    if (!profile) return false;
    if (profile.plan === 'pro' || profile.plan === 'enterprise') return true;
    return profile.scansUsed < profile.scansLimit;
  }

  // ── Auth Actions ──

  async function signInWithGoogle() {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      await ensureUserProfile(result.user);
      return { success: true, user: result.user };
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return { success: false, error: 'Sign-in cancelled.' };
      return { success: false, error: err.message };
    }
  }

  async function signUpWithEmail(email, password, displayName) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      if (displayName) {
        await result.user.updateProfile({ displayName: displayName });
      }
      await ensureUserProfile(result.user);
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  }

  async function signInWithEmail(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      await ensureUserProfile(result.user);
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  }

  async function resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  }

  function signOut() {
    return auth.signOut();
  }

  function onAuthChange(callback) {
    return auth.onAuthStateChanged(callback);
  }

  function currentUser() {
    return auth.currentUser;
  }

  function friendlyError(code) {
    const map = {
      'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Try again or reset it.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/user-disabled': 'This account has been disabled.'
    };
    return map[code] || 'Something went wrong. Please try again.';
  }

  // ── Auth Modal UI ──

  function injectAuthStyles() {
    if (document.getElementById('clawops-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'clawops-auth-styles';
    style.textContent = `
      .co-auth-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(5,8,16,0.85); backdrop-filter: blur(8px);
        z-index: 10000; display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.2s; pointer-events: none;
      }
      .co-auth-overlay.active { opacity: 1; pointer-events: all; }
      .co-auth-modal {
        background: #0a0f1a; border: 1px solid rgba(136,146,176,0.15);
        border-radius: 16px; padding: 2.5rem; max-width: 420px; width: 90%;
        position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      }
      .co-auth-modal h2 {
        font-family: "Space Grotesk", system-ui, sans-serif;
        font-size: 1.5rem; font-weight: 700; color: #f0f4ff;
        margin-bottom: 0.5rem; text-align: center;
      }
      .co-auth-modal .co-subtitle {
        color: #8892b0; font-size: 0.9rem; text-align: center; margin-bottom: 1.5rem;
      }
      .co-auth-close {
        position: absolute; top: 1rem; right: 1rem; background: none; border: none;
        color: #5a6480; font-size: 1.5rem; cursor: pointer; line-height: 1;
        padding: 0.25rem; transition: color 0.2s;
      }
      .co-auth-close:hover { color: #f0f4ff; }
      .co-google-btn {
        width: 100%; padding: 0.875rem; border-radius: 8px; border: 1px solid rgba(136,146,176,0.2);
        background: #111827; color: #f0f4ff; font-size: 1rem; font-weight: 600;
        cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
        transition: all 0.2s;
      }
      .co-google-btn:hover { background: #1a2332; border-color: rgba(136,146,176,0.35); }
      .co-google-btn svg { width: 20px; height: 20px; flex-shrink: 0; }
      .co-auth-divider {
        display: flex; align-items: center; gap: 1rem; margin: 1.25rem 0;
        color: #5a6480; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;
      }
      .co-auth-divider::before, .co-auth-divider::after {
        content: ''; flex: 1; height: 1px; background: rgba(136,146,176,0.15);
      }
      .co-auth-input {
        width: 100%; padding: 0.75rem 1rem; border-radius: 8px;
        border: 1px solid rgba(136,146,176,0.2); background: #111827;
        color: #f0f4ff; font-size: 0.95rem; margin-bottom: 0.75rem;
        transition: border-color 0.2s; outline: none;
        font-family: "Inter", system-ui, sans-serif;
      }
      .co-auth-input:focus { border-color: #00e5cc; }
      .co-auth-input::placeholder { color: #5a6480; }
      .co-auth-submit {
        width: 100%; padding: 0.875rem; border-radius: 8px; border: none;
        background: linear-gradient(135deg, #ff4d4d, #ff6b6b); color: #f0f4ff;
        font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 0.25rem;
        transition: all 0.2s;
      }
      .co-auth-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255,77,77,0.3); }
      .co-auth-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
      .co-auth-error {
        background: rgba(255,77,77,0.1); border: 1px solid rgba(255,77,77,0.3);
        border-radius: 8px; padding: 0.75rem 1rem; color: #ff6b6b;
        font-size: 0.85rem; margin-bottom: 0.75rem; display: none;
      }
      .co-auth-error.visible { display: block; }
      .co-auth-success {
        background: rgba(0,229,204,0.1); border: 1px solid rgba(0,229,204,0.3);
        border-radius: 8px; padding: 0.75rem 1rem; color: #00e5cc;
        font-size: 0.85rem; margin-bottom: 0.75rem; display: none;
      }
      .co-auth-success.visible { display: block; }
      .co-auth-toggle {
        text-align: center; margin-top: 1rem; font-size: 0.85rem; color: #8892b0;
      }
      .co-auth-toggle a {
        color: #00e5cc; text-decoration: none; cursor: pointer; font-weight: 500;
      }
      .co-auth-toggle a:hover { text-decoration: underline; }
      .co-auth-forgot {
        text-align: right; margin-top: -0.5rem; margin-bottom: 0.75rem;
      }
      .co-auth-forgot a {
        color: #8892b0; text-decoration: none; font-size: 0.8rem; cursor: pointer;
      }
      .co-auth-forgot a:hover { color: #00e5cc; }

      /* Nav auth button */
      .co-nav-auth {
        display: flex; align-items: center; gap: 0.75rem;
      }
      .co-nav-signin {
        padding: 0.5rem 1.25rem; border-radius: 6px;
        border: 1px solid rgba(0,229,204,0.4); background: transparent;
        color: #00e5cc; font-weight: 600; font-size: 0.9rem;
        cursor: pointer; transition: all 0.2s;
        font-family: "Inter", system-ui, sans-serif;
      }
      .co-nav-signin:hover { background: rgba(0,229,204,0.1); }
      .co-nav-user {
        display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
        position: relative;
      }
      .co-nav-avatar {
        width: 32px; height: 32px; border-radius: 50%;
        border: 2px solid rgba(0,229,204,0.4); object-fit: cover;
      }
      .co-nav-avatar-placeholder {
        width: 32px; height: 32px; border-radius: 50%;
        border: 2px solid rgba(0,229,204,0.4);
        background: #111827; display: flex; align-items: center;
        justify-content: center; color: #00e5cc; font-weight: 700;
        font-size: 0.85rem; font-family: "Space Grotesk", system-ui, sans-serif;
      }
      .co-nav-name {
        color: #f0f4ff; font-size: 0.9rem; font-weight: 500;
        max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .co-nav-dropdown {
        position: absolute; top: 100%; right: 0; margin-top: 0.5rem;
        background: #0a0f1a; border: 1px solid rgba(136,146,176,0.15);
        border-radius: 8px; min-width: 180px; padding: 0.5rem 0;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4); display: none; z-index: 10001;
      }
      .co-nav-dropdown.open { display: block; }
      .co-nav-dropdown-item {
        display: block; width: 100%; padding: 0.6rem 1rem; border: none;
        background: none; color: #8892b0; font-size: 0.85rem; text-align: left;
        cursor: pointer; transition: all 0.15s;
        font-family: "Inter", system-ui, sans-serif;
      }
      .co-nav-dropdown-item:hover { background: #111827; color: #f0f4ff; }
      .co-nav-dropdown-divider {
        height: 1px; background: rgba(136,146,176,0.15); margin: 0.25rem 0;
      }

      @media (max-width: 768px) {
        .co-auth-modal { padding: 1.5rem; }
        .co-nav-name { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  const GOOGLE_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.92.45 3.73 1.18 5.33l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

  function createAuthModal() {
    if (document.getElementById('co-auth-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'co-auth-overlay';
    overlay.className = 'co-auth-overlay';
    overlay.innerHTML = `
      <div class="co-auth-modal">
        <button class="co-auth-close" id="co-auth-close-btn">&times;</button>

        <div id="co-auth-signin-view">
          <h2>Welcome Back</h2>
          <p class="co-subtitle">Sign in to your ClawOps account</p>
          <div class="co-auth-error" id="co-signin-error"></div>
          <button class="co-google-btn" id="co-google-signin">${GOOGLE_SVG} Sign in with Google</button>
          <div class="co-auth-divider">or</div>
          <input type="email" class="co-auth-input" id="co-signin-email" placeholder="Email address" autocomplete="email">
          <input type="password" class="co-auth-input" id="co-signin-password" placeholder="Password" autocomplete="current-password">
          <div class="co-auth-forgot"><a id="co-forgot-link">Forgot password?</a></div>
          <button class="co-auth-submit" id="co-signin-submit">Sign In</button>
          <div class="co-auth-toggle">Don't have an account? <a id="co-show-signup">Sign up</a></div>
        </div>

        <div id="co-auth-signup-view" style="display:none">
          <h2>Create Account</h2>
          <p class="co-subtitle">Get started with ClawOps for free</p>
          <div class="co-auth-error" id="co-signup-error"></div>
          <button class="co-google-btn" id="co-google-signup">${GOOGLE_SVG} Sign up with Google</button>
          <div class="co-auth-divider">or</div>
          <input type="text" class="co-auth-input" id="co-signup-name" placeholder="Full name" autocomplete="name">
          <input type="email" class="co-auth-input" id="co-signup-email" placeholder="Email address" autocomplete="email">
          <input type="password" class="co-auth-input" id="co-signup-password" placeholder="Password (min 6 characters)" autocomplete="new-password">
          <button class="co-auth-submit" id="co-signup-submit">Create Account</button>
          <div class="co-auth-toggle">Already have an account? <a id="co-show-signin">Sign in</a></div>
        </div>

        <div id="co-auth-reset-view" style="display:none">
          <h2>Reset Password</h2>
          <p class="co-subtitle">We'll send you a link to reset your password</p>
          <div class="co-auth-error" id="co-reset-error"></div>
          <div class="co-auth-success" id="co-reset-success"></div>
          <input type="email" class="co-auth-input" id="co-reset-email" placeholder="Email address" autocomplete="email">
          <button class="co-auth-submit" id="co-reset-submit">Send Reset Link</button>
          <div class="co-auth-toggle"><a id="co-back-signin">Back to sign in</a></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close overlay
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeAuthModal();
    });
    document.getElementById('co-auth-close-btn').addEventListener('click', closeAuthModal);

    // View toggles
    document.getElementById('co-show-signup').addEventListener('click', function () {
      showView('signup');
    });
    document.getElementById('co-show-signin').addEventListener('click', function () {
      showView('signin');
    });
    document.getElementById('co-forgot-link').addEventListener('click', function () {
      showView('reset');
    });
    document.getElementById('co-back-signin').addEventListener('click', function () {
      showView('signin');
    });

    // Google sign in
    document.getElementById('co-google-signin').addEventListener('click', handleGoogleAuth);
    document.getElementById('co-google-signup').addEventListener('click', handleGoogleAuth);

    // Email sign in
    document.getElementById('co-signin-submit').addEventListener('click', handleEmailSignIn);
    document.getElementById('co-signin-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleEmailSignIn();
    });

    // Email sign up
    document.getElementById('co-signup-submit').addEventListener('click', handleEmailSignUp);
    document.getElementById('co-signup-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleEmailSignUp();
    });

    // Password reset
    document.getElementById('co-reset-submit').addEventListener('click', handlePasswordReset);
    document.getElementById('co-reset-email').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handlePasswordReset();
    });
  }

  function showView(view) {
    document.getElementById('co-auth-signin-view').style.display = view === 'signin' ? '' : 'none';
    document.getElementById('co-auth-signup-view').style.display = view === 'signup' ? '' : 'none';
    document.getElementById('co-auth-reset-view').style.display = view === 'reset' ? '' : 'none';
    clearErrors();
  }

  function clearErrors() {
    document.querySelectorAll('.co-auth-error, .co-auth-success').forEach(function (el) {
      el.classList.remove('visible');
      el.textContent = '';
    });
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    el.textContent = msg;
    el.classList.add('visible');
  }

  function showSuccess(id, msg) {
    var el = document.getElementById(id);
    el.textContent = msg;
    el.classList.add('visible');
  }

  function setLoading(btnId, loading) {
    var btn = document.getElementById(btnId);
    btn.disabled = loading;
    if (loading) {
      btn.dataset.origText = btn.textContent;
      btn.textContent = 'Please wait...';
    } else {
      btn.textContent = btn.dataset.origText || btn.textContent;
    }
  }

  async function handleGoogleAuth() {
    var result = await signInWithGoogle();
    if (result.success) {
      closeAuthModal();
    } else if (result.error) {
      showError('co-signin-error', result.error);
    }
  }

  async function handleEmailSignIn() {
    clearErrors();
    var email = document.getElementById('co-signin-email').value.trim();
    var password = document.getElementById('co-signin-password').value;
    if (!email || !password) {
      showError('co-signin-error', 'Please enter your email and password.');
      return;
    }
    setLoading('co-signin-submit', true);
    var result = await signInWithEmail(email, password);
    setLoading('co-signin-submit', false);
    if (result.success) {
      closeAuthModal();
    } else {
      showError('co-signin-error', result.error);
    }
  }

  async function handleEmailSignUp() {
    clearErrors();
    var name = document.getElementById('co-signup-name').value.trim();
    var email = document.getElementById('co-signup-email').value.trim();
    var password = document.getElementById('co-signup-password').value;
    if (!email || !password) {
      showError('co-signup-error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      showError('co-signup-error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading('co-signup-submit', true);
    var result = await signUpWithEmail(email, password, name);
    setLoading('co-signup-submit', false);
    if (result.success) {
      closeAuthModal();
    } else {
      showError('co-signup-error', result.error);
    }
  }

  async function handlePasswordReset() {
    clearErrors();
    var email = document.getElementById('co-reset-email').value.trim();
    if (!email) {
      showError('co-reset-error', 'Please enter your email address.');
      return;
    }
    setLoading('co-reset-submit', true);
    var result = await resetPassword(email);
    setLoading('co-reset-submit', false);
    if (result.success) {
      showSuccess('co-reset-success', 'Reset link sent! Check your inbox.');
    } else {
      showError('co-reset-error', result.error);
    }
  }

  function openAuthModal(view) {
    injectAuthStyles();
    createAuthModal();
    showView(view || 'signin');
    document.getElementById('co-auth-overlay').classList.add('active');
  }

  function closeAuthModal() {
    var overlay = document.getElementById('co-auth-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  // ── Nav Integration ──

  function renderNavAuth(containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'co-nav-auth';
    wrapper.id = 'co-nav-auth-wrapper';
    container.appendChild(wrapper);

    injectAuthStyles();

    onAuthChange(function (user) {
      wrapper.innerHTML = '';
      if (user) {
        var userEl = document.createElement('div');
        userEl.className = 'co-nav-user';

        var initial = (user.displayName || user.email || '?')[0].toUpperCase();
        var avatarHTML = user.photoURL
          ? '<img class="co-nav-avatar" src="' + user.photoURL + '" alt="Avatar" referrerpolicy="no-referrer">'
          : '<div class="co-nav-avatar-placeholder">' + initial + '</div>';

        var displayName = user.displayName || user.email.split('@')[0];

        userEl.innerHTML = avatarHTML +
          '<span class="co-nav-name">' + displayName + '</span>' +
          '<div class="co-nav-dropdown" id="co-nav-dropdown">' +
            '<div class="co-nav-dropdown-item" style="color:#5a6480;cursor:default;font-size:0.8rem;">' + user.email + '</div>' +
            '<div class="co-nav-dropdown-divider"></div>' +
            '<button class="co-nav-dropdown-item" id="co-nav-signout">Sign Out</button>' +
          '</div>';

        wrapper.appendChild(userEl);

        userEl.addEventListener('click', function (e) {
          e.stopPropagation();
          document.getElementById('co-nav-dropdown').classList.toggle('open');
        });

        document.addEventListener('click', function () {
          var dd = document.getElementById('co-nav-dropdown');
          if (dd) dd.classList.remove('open');
        });

        document.getElementById('co-nav-signout').addEventListener('click', function (e) {
          e.stopPropagation();
          signOut();
        });
      } else {
        var btn = document.createElement('button');
        btn.className = 'co-nav-signin';
        btn.textContent = 'Sign In';
        btn.addEventListener('click', function () { openAuthModal('signin'); });
        wrapper.appendChild(btn);
      }
    });
  }

  // ── Public API ──
  window.ClawOpsAuth = {
    signInWithGoogle: signInWithGoogle,
    signUpWithEmail: signUpWithEmail,
    signInWithEmail: signInWithEmail,
    resetPassword: resetPassword,
    signOut: signOut,
    onAuthChange: onAuthChange,
    currentUser: currentUser,
    getUserProfile: getUserProfile,
    incrementScanCount: incrementScanCount,
    canScan: canScan,
    openAuthModal: openAuthModal,
    closeAuthModal: closeAuthModal,
    renderNavAuth: renderNavAuth,
    PLAN_LIMITS: PLAN_LIMITS
  };

})();
