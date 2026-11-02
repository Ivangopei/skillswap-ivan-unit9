// Used AI for UI code

let skills = [];
let currentCategory = 'All';

const grid = document.getElementById('skills-grid');

function formatPrice(price) {
  return price === 0 ? 'Free' : '$' + price + ' / hour';
}

// Draws a list of skills as cards
function renderSkills(list) {
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<p>No skills found.</p>';
    return;
  }

  list.forEach(skill => {
    const card = document.createElement('article');
    card.className = 'skill-card';
    card.innerHTML = `
      <h3>${skill.title}</h3>
      <p class="provider">Taught by ${skill.provider}</p>
      <p class="price">${formatPrice(skill.price)}</p>
      <p>${skill.description}</p>
      <p class="hint">Click to see more</p>
      <p class="details">Category: ${skill.category}</p>
    `;

    // Click a card to show/hide its details
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
      const hint = card.querySelector('.hint');
      hint.textContent = card.classList.contains('expanded')
        ? 'Click to hide details'
        : 'Click to see more';
    });

    grid.appendChild(card);
  });
}

// Loads skills from the backend API, then shows them
async function loadSkills() {
  grid.innerHTML = '<p>Loading skills...</p>';
  try {
    skills = await window.apiService.fetchSkills();
    renderSkills(filterSkillsByCategory(skills, currentCategory));
  } catch (error) {
    grid.innerHTML = '<p>Could not load skills. Make sure the backend server is running.</p>';
  }
}

// Filter buttons call filterSkillsByCategory and redraw the cards
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentCategory = button.dataset.category;
    renderSkills(filterSkillsByCategory(skills, currentCategory));
  });
});

// Cost calculator uses calculateTotalCost
document.getElementById('calc-btn').addEventListener('click', () => {
  const rate = Number(document.getElementById('rate-input').value);
  const hours = Number(document.getElementById('hours-input').value);

  const total = calculateTotalCost(rate, hours);
  document.getElementById('calc-result').textContent = `Total cost: $${total.toFixed(2)}`;
});

// Find My Match uses matchSkillsToUser
document.getElementById('match-btn').addEventListener('click', () => {
  const userNeeds = {
    category: document.getElementById('match-category').value,
    maxPrice: Number(document.getElementById('match-price').value)
  };

  const matches = matchSkillsToUser(userNeeds, skills);
  const results = document.getElementById('match-results');
  results.innerHTML = '';

  if (matches.length === 0) {
    results.innerHTML = '<p>No matches found. Try a higher max price or another category.</p>';
    return;
  }

  matches.forEach(skill => {
    const card = document.createElement('article');
    card.className = 'skill-card';
    card.innerHTML = `
      <h3>${skill.title}</h3>
      <p class="provider">Taught by ${skill.provider}</p>
      <p class="price">${formatPrice(skill.price)}</p>
      <p>${skill.description}</p>
    `;
    results.appendChild(card);
  });
});

// Load skills from the database when the page opens
loadSkills();

document.getElementById('skill-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.getElementById('form-message');

  const newSkill = {
    title: document.getElementById('skill-title').value.trim(),
    category: document.getElementById('skill-category').value,
    price: Number(document.getElementById('skill-price').value),
    provider: document.getElementById('skill-provider').value.trim(),
    description: document.getElementById('skill-description').value.trim()
  };

  try {
    await window.apiService.createSkill(newSkill);
    message.textContent = 'Skill added!';
    event.target.reset();
    await loadSkills();
  } catch (error) {
    message.textContent = 'Could not add skill. Please try again.';
  }
});