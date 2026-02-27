/**
 * ClawOps Cookie Consent Banner
 * Lightweight, dark-themed cookie consent that matches the site design.
 * Include this script on any page: <script src="/js/cookie-consent.js" defer></script>
 */
(function() {
  'use strict';

  // Check if user already accepted
  if (document.cookie.indexOf('clawops_cookie_consent=accepted') !== -1) {
    return;
  }

  // Create banner
  var banner = document.createElement('div');
  banner.id = 'clawops-cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = '<div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">'
    + '<p style="margin:0;font-size:.875rem;color:#8898b8;line-height:1.5;flex:1;min-width:280px;">'
    + 'We use essential cookies for authentication and site functionality. By continuing to use this site, you consent to our use of cookies. '
    + '<a href="/privacy/" style="color:#60a5fa;text-decoration:underline;">Privacy Policy</a>'
    + '</p>'
    + '<button id="clawops-cookie-accept" style="background:#3b82f6;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:600;font-size:.875rem;cursor:pointer;white-space:nowrap;font-family:Inter,system-ui,sans-serif;transition:background .2s;">Accept</button>'
    + '</div>';

  // Style the banner
  banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(6,10,20,.95);backdrop-filter:blur(16px);border-top:1px solid rgba(96,165,250,.12);padding:16px 24px;font-family:Inter,system-ui,sans-serif;';

  // Append to body when DOM is ready
  function init() {
    document.body.appendChild(banner);

    var btn = document.getElementById('clawops-cookie-accept');
    if (btn) {
      btn.addEventListener('mouseover', function() { btn.style.background = '#60a5fa'; });
      btn.addEventListener('mouseout', function() { btn.style.background = '#3b82f6'; });
      btn.addEventListener('click', function() {
        // Set cookie for 1 year
        var d = new Date();
        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie = 'clawops_cookie_consent=accepted;expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
        banner.style.transition = 'opacity .3s, transform .3s';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(100%)';
        setTimeout(function() { banner.remove(); }, 300);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
