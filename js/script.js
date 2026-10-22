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

// Calcul de la zone de déplacement à vol d'oiseau depuis Devecey
const GEO_API = 'https://geo.api.gouv.fr/communes';
const GEO_FIELDS = 'nom,code,codesPostaux,centre';
// Centre de Devecey, utilisé si l'API ne répond pas pour Devecey
let deveceyCentre = { lat: 47.3236, lon: 6.0203 };

const ZONES = [
  { zone: 1, maxKm: 7, price: '5 €' },
  { zone: 2, maxKm: 15, price: '15 €' },
  { zone: 3, maxKm: 25, price: '25 €' },
];

function distanceKm(a, b) {
  const rad = deg => deg * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// Seuils : moins de 7 km, 7 à 15 km, 15 à 25 km inclus, puis sur devis
function zoneFor(km) {
  if (km > ZONES[ZONES.length - 1].maxKm) return null;
  return ZONES.find(z => km < z.maxKm) || ZONES[ZONES.length - 1];
}

function buildCommuneQuery(text) {
  const params = new URLSearchParams({ fields: GEO_FIELDS, limit: '6' });
  const postcode = text.match(/\b\d{5}\b/);
  const name = text.replace(/\d+/g, '').trim();
  if (postcode) params.set('codePostal', postcode[0]);
  if (name.length >= 2) {
    params.set('nom', name);
    params.set('boost', 'population');
  }
  if (!postcode && name.length < 2) return null;
  return `${GEO_API}?${params}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('commune-input');
  if (!input) return;
  const list = document.getElementById('commune-suggestions');
  const result = document.getElementById('commune-result');
  const zoneCards = document.querySelectorAll('#travel-zones .zone-card');
  let suggestions = [];
  let activeIndex = -1;
  let debounce;
  let requestId = 0;

  fetch(`${GEO_API}?nom=Devecey&codePostal=25870&fields=centre&limit=1`)
    .then(r => r.json())
    .then(data => {
      const coords = data[0] && data[0].centre && data[0].centre.coordinates;
      if (coords) deveceyCentre = { lat: coords[1], lon: coords[0] };
    })
    .catch(() => {});

  function closeList() {
    list.classList.add('hidden');
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  }

  function highlight(index) {
    activeIndex = index;
    list.querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', i === index ? 'true' : 'false'));
  }

  function renderList(postcodeTyped) {
    list.innerHTML = '';
    suggestions.forEach((commune, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      const postcode = postcodeTyped && commune.codesPostaux.includes(postcodeTyped) ? postcodeTyped : commune.codesPostaux[0];
      li.textContent = `${commune.nom} (${postcode})`;
      li.addEventListener('mousedown', e => { e.preventDefault(); select(i); });
      list.appendChild(li);
    });
    list.classList.toggle('hidden', suggestions.length === 0);
    input.setAttribute('aria-expanded', suggestions.length ? 'true' : 'false');
    activeIndex = -1;
  }

  function showZone(zone) {
    zoneCards.forEach(card => card.classList.toggle('active', card.dataset.zone === String(zone ? zone.zone : 0)));
  }

  function select(index) {
    const commune = suggestions[index];
    if (!commune) return;
    input.value = list.children[index].textContent;
    closeList();
    const [lon, lat] = commune.centre.coordinates;
    // Tronquée au dixième pour que la distance affichée corresponde toujours à la tranche
    const km = Math.floor(distanceKm(deveceyCentre, { lat, lon }) * 10) / 10;
    const zone = zoneFor(km);
    const kmText = km.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    showZone(zone);
    result.innerHTML = zone
      ? `<strong class="text-ink">${commune.nom}</strong> est à ${kmText} km : forfait de <strong class="text-ink">${zone.price}</strong> par déplacement.`
      : `<strong class="text-ink">${commune.nom}</strong> est à ${kmText} km : <a href="#contact" class="underline underline-offset-2 hover:text-brand transition">contactez-moi</a> pour un devis.`;
  }

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    zoneCards.forEach(card => card.classList.remove('active'));
    result.textContent = '';
    const url = buildCommuneQuery(input.value);
    if (!url) { suggestions = []; closeList(); return; }
    const postcode = (input.value.match(/\b\d{5}\b/) || [])[0];
    debounce = setTimeout(() => {
      const current = ++requestId;
      fetch(url)
        .then(r => r.json())
        .then(data => {
          if (current !== requestId) return;
          suggestions = data.filter(c => c.centre);
          renderList(postcode);
          if (!suggestions.length) result.textContent = 'Aucune commune trouvée.';
        })
        .catch(() => {
          if (current !== requestId) return;
          suggestions = [];
          closeList();
          result.textContent = 'Recherche indisponible pour le moment, contactez-moi pour connaître votre zone.';
        });
    }, 250);
  });

  input.addEventListener('keydown', e => {
    if (list.classList.contains('hidden')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); highlight(Math.min(activeIndex + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(Math.max(activeIndex - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); select(activeIndex >= 0 ? activeIndex : 0); }
    else if (e.key === 'Escape') closeList();
  });

  input.addEventListener('blur', closeList);
});
