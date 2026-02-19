// Starfield
(function() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const COUNT = 200;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    stars = [];
    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        da: (Math.random() - 0.5) * 0.01
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Gradient overlay
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    g.addColorStop(0, 'rgba(15,20,40,0.8)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.a += s.da;
      if (s.a > 1 || s.a < 0.1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,210,230,${s.a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

// Mobile menu toggle
document.querySelector('.nav-toggle').addEventListener('click', function() {
  document.querySelector('.mobile-menu').classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu a').forEach(function(link) {
  link.addEventListener('click', function() {
    document.querySelector('.mobile-menu').classList.remove('open');
  });
});

// Scroll fade-in
(function() {
  const els = document.querySelectorAll('.card, .step, .pricing-card, .about-text, .about-terminal, .contact-form');
  els.forEach(function(el) { el.classList.add('fade-in'); });

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  els.forEach(function(el) { observer.observe(el); });
})();

// Nav background on scroll
window.addEventListener('scroll', function() {
  const nav = document.querySelector('.nav');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(10,14,26,0.95)';
  } else {
    nav.style.background = 'rgba(10,14,26,0.85)';
  }
});
