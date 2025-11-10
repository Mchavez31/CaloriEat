/********************************
 * STANDALONE SET GOALS PAGE - WITH SUGAR TRACKING
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
const goalSelect = document.getElementById('goal');
const targetCaloriesInput = document.getElementById('targetCalories');
const saveGoalBtn = document.getElementById('saveGoalBtn');
const proteinTargetInput = document.getElementById('proteinTarget');
const carbsTargetInput = document.getElementById('carbsTarget');
const fatTargetInput = document.getElementById('fatTarget');
const sugarTargetInput = document.getElementById('sugarTarget');
const veggiesTargetInput = document.getElementById('veggiesTarget');
const saveTargetsBtn = document.getElementById('saveTargetsBtn');
const currentGoalDisplay = document.getElementById('currentGoalDisplay');

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

// Load current goals
function loadGoals() {
  const user = profiles[currentUser];
  if (!user) return;

  // Load calorie goal
  if (user.goal) {
    goalSelect.value = user.goal.type || 'maintain';
    targetCaloriesInput.value = user.goal.target || '';
  }

  // Load macro targets
  if (user.macroGoals) {
    proteinTargetInput.value = user.macroGoals.proteinTarget || '';
    carbsTargetInput.value = user.macroGoals.carbsTarget || '';
    fatTargetInput.value = user.macroGoals.fatTarget || '';
    sugarTargetInput.value = user.macroGoals.sugarTarget || '';
    veggiesTargetInput.value = user.macroGoals.veggiesTarget || '';
  }

  displayCurrentGoals();
}

// Display current goals
function displayCurrentGoals() {
  const user = profiles[currentUser];
  if (!user) return;

  let goalText = '';

  if (user.goal) {
    goalText += `<strong>Calorie Goal:</strong> ${user.goal.type} - ${user.goal.target} cal/day<br>`;
  } else {
    goalText += `<strong>Calorie Goal:</strong> Not set<br>`;
  }

  if (user.macroGoals) {
    goalText += `<strong>Protein:</strong> ${user.macroGoals.proteinTarget || 0}g | `;
    goalText += `<strong>Carbs:</strong> ${user.macroGoals.carbsTarget || 0}g | `;
    goalText += `<strong>Fat:</strong> ${user.macroGoals.fatTarget || 0}g | `;
    goalText += `<strong>Sugar:</strong> ${user.macroGoals.sugarTarget || 0}g | `;
    goalText += `<strong>Veggies:</strong> ${user.macroGoals.veggiesTarget || 0} servings`;
  } else {
    goalText += `<strong>Macro Targets:</strong> Not set`;
  }

  currentGoalDisplay.innerHTML = goalText;
}

// Save calorie goal
if (saveGoalBtn) {
  saveGoalBtn.addEventListener('click', () => {
    const goalType = goalSelect.value;
    const target = parseInt(targetCaloriesInput.value);

    if (isNaN(target) || target <= 0) {
      alert('Please enter a valid calorie goal.');
      return;
    }

    const user = profiles[currentUser];
    if (!user) return;

    user.goal = { type: goalType, target };
    localStorage.setItem('profiles', JSON.stringify(profiles));

    alert('Calorie goal saved successfully!');
    displayCurrentGoals();
  });
}

// Save macro targets
if (saveTargetsBtn) {
  saveTargetsBtn.addEventListener('click', () => {
    const pT = parseFloat(proteinTargetInput.value) || 0;
    const cT = parseFloat(carbsTargetInput.value) || 0;
    const fT = parseFloat(fatTargetInput.value) || 0;
    const sT = parseFloat(sugarTargetInput.value) || 0;
    const vT = parseFloat(veggiesTargetInput.value) || 0;

    const user = profiles[currentUser];
    if (!user) return;

    if (!user.macroGoals) user.macroGoals = {};
    user.macroGoals.proteinTarget = pT;
    user.macroGoals.carbsTarget = cT;
    user.macroGoals.fatTarget = fT;
    user.macroGoals.sugarTarget = sT;
    user.macroGoals.veggiesTarget = vT;

    localStorage.setItem('profiles', JSON.stringify(profiles));
    alert('Macro targets saved successfully!');
    displayCurrentGoals();
  });
}

// Initial load
loadGoals();