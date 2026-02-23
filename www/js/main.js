// Premium UI Logic
document.addEventListener('DOMContentLoaded', function() {
  // Navigation Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
  }

  // Header scroll effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // Close menu on link click
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.textContent = '☰';
      }
    });
  });

  // Scroll Reveal Animation
  const observerOptions = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('section, .features li, main').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });

  // FAQ Modal (AI Help Bot) - Simplified
  const faqBtn = document.createElement('button');
  faqBtn.textContent = '?';
  faqBtn.className = 'faq-btn';
  faqBtn.style.display = 'none'; // Hiding AI/Help stuff as requested indirectly by 'hide admin/ai'
  document.body.appendChild(faqBtn);

  // Hidden Administration Logic (Disabled)
  console.log('Admin panel hidden and disabled as per user request.');
});