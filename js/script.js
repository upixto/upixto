// Gestion du menu latéral
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('section');
  const dots = document.querySelectorAll('.side-menu .dot');
  
  // Fonction pour détecter quelle section est visible
  function updateActiveSection() {
    // Désactiver sur mobile
    if (window.innerWidth <= 768) return;
    
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
    // Désactiver sur mobile
    if (window.innerWidth <= 768) return;
    
    const targetSection = sections[sectionNumber - 1];
    if (targetSection) {
      targetSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  // Écouter le scroll pour mettre à jour la section active
  let ticking = false;
  function requestTick() {
    // Désactiver sur mobile
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
  
  // Ajouter les événements de clic sur les points
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      scrollToSection(index + 1);
    });
  });
  
  // Initialiser la section active au chargement
  updateActiveSection();
});

// Fonction pour copier l'email dans le presse-papiers
function copyEmail() {
  const email = 'contact@upixto.fr';
  
  // Utiliser l'API Clipboard moderne si disponible
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(email).then(() => {
      showCopyFeedback();
    }).catch(() => {
      fallbackCopyEmail(email);
    });
  } else {
    fallbackCopyEmail(email);
  }
}

// Méthode de fallback pour copier l'email
function fallbackCopyEmail(email) {
  const textArea = document.createElement('textarea');
  textArea.value = email;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyFeedback();
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
  }
  
  document.body.removeChild(textArea);
}

// Afficher un feedback visuel de la copie
function showCopyFeedback() {
  // Créer un toast temporaire
  const toast = document.createElement('div');
  toast.textContent = 'Email copié !';
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
  document.body.appendChild(toast);
  
  // Supprimer le toast après 2 secondes
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 2000);
} 