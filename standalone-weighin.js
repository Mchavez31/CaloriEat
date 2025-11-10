/********************************
 * STANDALONE WEIGH IN PAGE
 ********************************/

let currentUser = localStorage.getItem('currentUser') || null;
let profiles = JSON.parse(localStorage.getItem('profiles')) || {};

// Check if user is logged in
if (!currentUser) {
  alert('Please log in first');
  window.location.href = 'Index_Modular.html';
}

// DOM Elements
const menuIcon = document.getElementById('menuIcon');
const menuDropdown = document.getElementById('menuDropdown');
const menuLogout = document.getElementById('menuLogout');
const weighInLbsInput = document.getElementById('weighInLbs');
const addWeighInBtn = document.getElementById('addWeighInBtn');
const weightHistory = document.getElementById('weightHistory');

// Menu toggle
if (menuIcon) {
  menuIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!menuDropdown) return;
    menuDropdown.style.display =
      (menuDropdown.style.display === 'block') ? 'none' : 'block';
  });
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  if (menuDropdown) menuDropdown.style.display = 'none';
});

// Logout functionality
if (menuLogout) {
  menuLogout.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'Index_Modular.html';
  });
}

// Helper function
function todayStr() {
  return new Date().toLocaleDateString();
}

// Display weight history
function displayWeightHistory() {
  const user = profiles[currentUser];
  if (!user || !user.weighIns || user.weighIns.length === 0) {
    weightHistory.innerHTML = '<p style="color: #aaa;">No weight entries yet.</p>';
    return;
  }

  weightHistory.innerHTML = '';
  
  // Show most recent entries first
  const sorted = [...user.weighIns].reverse();
  
  sorted.forEach((entry, index) => {
    const entryDiv = document.createElement('div');
    entryDiv.style.cssText = 'background: #2a2a2a; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;';
    
    const info = document.createElement('span');
    info.textContent = `${entry.date}: ${entry.weightLbs} lbs`;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'small-btn delete';
    deleteBtn.textContent = '🗑 Delete';
    deleteBtn.style.width = 'auto';
    deleteBtn.addEventListener('click', () => {
      deleteWeighIn(user.weighIns.length - 1 - index);
    });
    
    entryDiv.appendChild(info);
    entryDiv.appendChild(deleteBtn);
    weightHistory.appendChild(entryDiv);
  });
}

// Add weigh in
if (addWeighInBtn) {
  addWeighInBtn.addEventListener('click', () => {
    const wVal = weighInLbsInput.value.trim();
    if (!wVal || isNaN(parseFloat(wVal))) {
      alert('Please enter a valid weight in lbs.');
      return;
    }

    const user = profiles[currentUser];
    if (!user) return;

    if (!user.weighIns) {
      user.weighIns = [];
    }

    user.weighIns.push({
      date: todayStr(),
      weightLbs: parseFloat(wVal)
    });

    user.weightLbs = parseFloat(wVal);

    localStorage.setItem('profiles', JSON.stringify(profiles));
    weighInLbsInput.value = '';

    alert('Weight recorded successfully!');
    displayWeightHistory();
  });
}

// Delete weigh in
function deleteWeighIn(index) {
  if (!confirm('Delete this weight entry?')) return;

  const user = profiles[currentUser];
  user.weighIns.splice(index, 1);
  
  // Update current weight to most recent entry
  if (user.weighIns.length > 0) {
    user.weightLbs = user.weighIns[user.weighIns.length - 1].weightLbs;
  }

  localStorage.setItem('profiles', JSON.stringify(profiles));
  displayWeightHistory();
}

// Initial display
displayWeightHistory();