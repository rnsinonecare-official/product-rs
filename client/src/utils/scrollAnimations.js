// Minimal scroll utilities for better performance

export const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Only observe fade-in elements
  const animatedElements = document.querySelectorAll('.scroll-fade-in');
  animatedElements.forEach(el => observer.observe(el));

  return observer;
};

export const initAllScrollAnimations = () => {
  // Only initialize basic scroll animations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollAnimations();
    });
  } else {
    initScrollAnimations();
  }
};

// Smooth scroll to element
export const smoothScrollTo = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};