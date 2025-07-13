// Gestion du menu latéral
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('section');
  const dots = document.querySelectorAll('.side-menu .dot');
  
  // Fonction pour détecter quelle section est visible
  function updateActiveSection() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        // Retirer la classe active de tous les points
        dots.forEach(dot => dot.classList.remove('active'));
        // Ajouter la classe active au point correspondant
        if (dots[index]) {
          dots[index].classList.add('active');
        }
      }
    });
  }
  
  // Fonction pour naviguer vers une section
  function scrollToSection(sectionNumber) {
    const targetSection = sections[sectionNumber - 1];
    if (targetSection) {
      targetSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  // Écouter le scroll pour mettre à jour la section active
  window.addEventListener('scroll', updateActiveSection);
  
  // Ajouter les événements de clic sur les points
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      scrollToSection(index + 1);
    });
  });
  
  // Initialiser la section active au chargement
  updateActiveSection();
}); 