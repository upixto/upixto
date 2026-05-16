// Gestion du menu latéral
let _sections;

function scrollToSection(sectionNumber) {
  if (window.innerWidth <= 768) return;
  if (!_sections) _sections = document.querySelectorAll('section');
  const targetSection = _sections[sectionNumber - 1];
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  _sections = document.querySelectorAll('section');
  const dots = document.querySelectorAll('.side-menu .dot');

  function updateActiveSection() {
    if (window.innerWidth <= 768) return;
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    _sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[index]) {
          dots[index].classList.add('active');
        }
      }
    });
  }

  let ticking = false;
  function requestTick() {
    if (window.innerWidth <= 768) return;
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      scrollToSection(index + 1);
    });
  });

  updateActiveSection();
});

// Définir l'année dynamique dans le footer
function setDynamicYear() {
  const yearElements = document.querySelectorAll('#year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(element => {
    element.textContent = currentYear;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setDynamicYear();
});
