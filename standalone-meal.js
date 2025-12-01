/********************************
 * STANDALONE ADD MEAL PAGE - WITH SUGAR TRACKING AND VEGGIE CUPS
 ********************************/

console.log('=== STANDALONE-MEAL.JS LOADED ===');

let currentUser = localStorage.getItem('currentUser') || null;
console.log('Current User:', currentUser);

let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
console.log('Profiles loaded:', Object.keys(profiles));

// Track whether we're showing all history or just today
let showAllHistory = false;

// Track selected meal type
let selectedMealType = null;

// Veggie conversion constant: 1 cup ≈ 90g (average for raw vegetables)
const VEGGIE_CUPS_TO_GRAMS = 90;
// Veggie calories per gram: approximately 0.3 cal/g (average for vegetables)
const VEGGIE_CALORIES_PER_GRAM = 0.3;

const foodDB = [
  { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, sugar: 19 },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, sugar: 14 },
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0 },
  { name: 'Chicken Thigh', calories: 209, protein: 26, carbs: 0, fat: 11, sugar: 0 },
  { name: 'Chicken Wings', calories: 203, protein: 30, carbs: 0, fat: 8, sugar: 0 },
  { name: 'Rice (1 cup)', calories: 206, protein: 4.3, carbs: 45, fat: 0.4, sugar: 0 },
  { name: 'Brown Rice (1 cup)', calories: 218, protein: 4.5, carbs: 46, fat: 1.6, sugar: 1 },
  { name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fat: 5, sugar: 0.6 },
  { name: 'Burger', calories: 354, protein: 20, carbs: 30, fat: 17, sugar: 6 },
  { name: 'Salad', calories: 150, protein: 5, carbs: 15, fat: 8, sugar: 5 },
  { name: 'Caesar Salad', calories: 481, protein: 36, carbs: 23, fat: 28, sugar: 4 },
  { name: 'Steak', calories: 679, protein: 62, carbs: 0, fat: 50, sugar: 0 },
  { name: 'Salmon', calories: 367, protein: 40, carbs: 0, fat: 22, sugar: 0 },
  { name: 'Tuna', calories: 132, protein: 28, carbs: 0, fat: 1, sugar: 0 },
  { name: 'Broccoli (1 cup)', calories: 31, protein: 2.6, carbs: 6, fat: 0.3, sugar: 1.5 },
  { name: 'Carrots (1 cup)', calories: 52, protein: 1.2, carbs: 12, fat: 0.3, sugar: 6 },
  { name: 'Pasta (1 cup)', calories: 221, protein: 8, carbs: 43, fat: 1.3, sugar: 1 },
  { name: 'Pizza Slice', calories: 285, protein: 12, carbs: 36, fat: 10, sugar: 4 },
  { name: 'Yogurt (1 cup)', calories: 149, protein: 8.5, carbs: 11.4, fat: 8, sugar: 11 },
  { name: 'Oatmeal (1 cup)', calories: 166, protein: 5.9, carbs: 28, fat: 3.6, sugar: 1 }
];

// Check if user is logged in
if (!currentUser) {
  console.error('No user logged in! Redirecting...');
  alert('Please log in first');
  window.location.href = 'Index_Modular.html';
}

// DOM Elements
const menuIcon = document.getElementById('menuIcon');
const menuDropdown = document.getElementById('menuDropdown');
const menuLogout = document.getElementById('menuLogout');
const mealInput = document.getElementById('meal');
const calInput = document.getElementById('calories');
const proteinInput = document.getElementById('protein');
const carbsInput = document.getElementById('carbs');
const fatInput = document.getElementById('fat');
const sugarInput = document.getElementById('sugar');
const veggiesInput = document.getElementById('veggies');
const veggiesGramsDisplay = document.getElementById('veggiesGrams');
const addMealBtn = document.getElementById('addMealBtn');
const mealList = document.getElementById('mealList');
const foodSearch = document.getElementById('foodSearch');
const foodResults = document.getElementById('foodResults');
const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
const mealListTitle = document.getElementById('mealListTitle');
const mealTypeButtons = document.querySelectorAll('.meal-type-btn');

console.log('DOM Elements found:', {
  menuIcon: !!menuIcon,
  menuDropdown: !!menuDropdown,
  addMealBtn: !!addMealBtn,
  foodSearch: !!foodSearch,
  foodResults: !!foodResults,
  sugarInput: !!sugarInput,
  toggleHistoryBtn: !!toggleHistoryBtn,
  veggiesGramsDisplay: !!veggiesGramsDisplay
});

// Helper function
function todayStr() {
  return new Date().toLocaleDateString();
}

// Helper to convert local date string to YYYY-MM-DD format for date input
function toDateInputValue(dateStr) {
  if (!dateStr) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Parse the local date string (e.g., "11/22/2024")
  const parsed = new Date(dateStr);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Veggie cups to grams converter
function updateVeggieGrams() {
  if (!veggiesInput || !veggiesGramsDisplay) return;
  
  const cups = parseFloat(veggiesInput.value) || 0;
  const grams = Math.round(cups * VEGGIE_CUPS_TO_GRAMS);
  veggiesGramsDisplay.textContent = `≈ ${grams}g`;
}

// Calculate veggie servings based on cups and calories
function calculateVeggieServings(cups, totalCalories) {
  // Convert cups to grams
  const grams = cups * VEGGIE_CUPS_TO_GRAMS;
  
  // Calculate expected veggie calories
  const expectedVeggieCals = grams * VEGGIE_CALORIES_PER_GRAM;
  
  // Servings = veggie calories / 100 (assuming 1 serving ≈ 100 calories of veggies)
  // This is a rough estimate to track veggie intake
  const servings = expectedVeggieCals / 100;
  
  return {
    servings: Math.round(servings * 10) / 10, // Round to 1 decimal
    grams: Math.round(grams),
    calories: Math.round(expectedVeggieCals)
  };
}

// Add event listener for veggie input
if (veggiesInput) {
  veggiesInput.addEventListener('input', updateVeggieGrams);
}

// Menu toggle
if (menuIcon) {
  console.log('Setting up menu icon click handler');
  menuIcon.addEventListener('click', (e) => {
    console.log('Menu icon clicked!');
    e.stopPropagation();
    if (!menuDropdown) {
      console.error('menuDropdown not found!');
      return;
    }
    
    // Toggle display
    if (menuDropdown.style.display === 'block') {
      console.log('Closing menu');
      menuDropdown.style.display = 'none';
    } else {
      console.log('Opening menu');
      menuDropdown.style.display = 'block';
    }
  });
} else {
  console.error('menuIcon element not found!');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (menuDropdown && !menuIcon.contains(e.target) && !menuDropdown.contains(e.target)) {
    console.log('Clicked outside menu, closing');
    menuDropdown.style.display = 'none';
  }
});

// Prevent dropdown from closing when clicking inside it
if (menuDropdown) {
  menuDropdown.addEventListener('click', (e) => {
    console.log('Clicked inside dropdown');
    e.stopPropagation();
  });
}

// Logout functionality
if (menuLogout) {
  menuLogout.addEventListener('click', (e) => {
    console.log('Logout clicked');
    e.preventDefault();
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'Index_Modular.html';
  });
}

// Meal type button selection
if (mealTypeButtons) {
  mealTypeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mealType = btn.getAttribute('data-type');
      
      // Remove selected class from all buttons
      mealTypeButtons.forEach(b => b.classList.remove('selected'));
      
      // Add selected class to clicked button
      btn.classList.add('selected');
      
      // Store selected meal type
      selectedMealType = mealType;
      console.log('Meal type selected:', selectedMealType);
    });
  });
}

// Food search autofill
if (foodSearch) {
  console.log('Setting up food search');
  foodSearch.addEventListener('input', () => {
    const query = foodSearch.value.toLowerCase().trim();
    console.log('Food search input:', query);
    
    foodResults.innerHTML = '';
    
    if (query.length === 0) {
      foodResults.style.display = 'none';
      return;
    }

    const results = foodDB.filter(f => f.name.toLowerCase().includes(query));
    console.log('Found results:', results.length);
    
    if (results.length === 0) {
      foodResults.style.display = 'none';
      return;
    }

    foodResults.style.display = 'block';
    
    results.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} - ${item.calories} cal (P: ${item.protein}g, C: ${item.carbs}g, F: ${item.fat}g, Sugar: ${item.sugar}g)`;
      li.style.cursor = 'pointer';
      li.style.padding = '8px';
      li.style.fontSize = '0.9rem';
      
      li.addEventListener('click', () => {
        console.log('Selected food:', item.name);
        // Auto-fill all fields
        mealInput.value = item.name;
        calInput.value = item.calories;
        proteinInput.value = item.protein;
        carbsInput.value = item.carbs;
        fatInput.value = item.fat;
        sugarInput.value = item.sugar;
        
        // Clear search
        foodSearch.value = '';
        foodResults.innerHTML = '';
        foodResults.style.display = 'none';
      });
      
      foodResults.appendChild(li);
    });
  });

  // Close food results when clicking outside
  document.addEventListener('click', (e) => {
    if (foodResults && !foodSearch.contains(e.target) && !foodResults.contains(e.target)) {
      foodResults.style.display = 'none';
    }
  });
} else {
  console.error('foodSearch element not found!');
}

// Add Meal functionality
if (addMealBtn) {
  console.log('Setting up Add Meal button');
  addMealBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Add Meal clicked');

    // Get meal name from search input OR hidden meal field
    const searchInput = document.getElementById('foodSearchInput');
    const mealName = mealInput ? mealInput.value.trim() : "";
    
    const cals = calInput.value.trim();
    const prot = proteinInput.value.trim();
    const crbs = carbsInput.value.trim();
    const ft = fatInput.value.trim();
    const sgr = sugarInput.value.trim();
    const vegCups = veggiesInput.value.trim();

    console.log('Meal data:', { mealName, cals, selectedMealType });

    if (!mealName || !cals) {
      alert('Please enter meal name and calories');
      return;
    }

    // Validate no negative numbers
    if (cals < 0 || prot < 0 || carb < 0 || fatVal < 0 || sug < 0 || vegCups < 0) {
      alert('Please enter positive values only. Negative numbers are not allowed.');
      return;
    }

    const user = profiles[currentUser];
    if (!user) {
      console.error('User not found in profiles');
      return;
    }

    if (!user.meals) {
      user.meals = [];
    }

    // Calculate veggie data
    const veggieCups = parseFloat(vegCups) || 0;
    const veggieData = calculateVeggieServings(veggieCups, parseFloat(cals));

    const newMeal = {
      name: mealName,
      calories: parseInt(cals),
      protein: parseFloat(prot) || 0,
      carbs: parseFloat(crbs) || 0,
      fat: parseFloat(ft) || 0,
      sugar: parseFloat(sgr) || 0,
      veggies: veggieData.servings, // Store calculated servings
      veggieCups: veggieCups, // Store original cups input
      veggieGrams: veggieData.grams, // Store grams for display
      veggieCalories: veggieData.calories, // Store veggie calories
      date: todayStr(),
      mealType: selectedMealType
    };

    console.log('Creating meal:', newMeal);
    user.meals.push(newMeal);

    localStorage.setItem('profiles', JSON.stringify(profiles));
    console.log('Meal saved to localStorage');

    // Clear all inputs including search box
    if (searchInput) searchInput.value = '';
    if (mealInput) mealInput.value = '';
    calInput.value = '';
    proteinInput.value = '';
    carbsInput.value = '';
    fatInput.value = '';
    sugarInput.value = '';
    veggiesInput.value = '';
    updateVeggieGrams();
    
    // Clear meal type selection
    selectedMealType = null;
    mealTypeButtons.forEach(b => b.classList.remove('selected'));

    alert('Meal added successfully!');
    renderMeals();
  });
} else {
  console.error('addMealBtn not found!');
}

// Render meals
function renderMeals() {
  console.log('=== RENDERING MEALS ===');
  
  const user = profiles[currentUser];
  if (!user || !user.meals) {
    console.log('No meals to render');
    mealList.innerHTML = '<p style="color: #aaa;">No meals logged yet.</p>';
    return;
  }

  mealList.innerHTML = '';
  const today = todayStr();
  console.log('Today is:', today);

  // Filter meals based on view mode
  let mealsToShow = showAllHistory 
    ? user.meals 
    : user.meals.filter(m => m.date === today);
  
  console.log(`Showing ${mealsToShow.length} meals (showAllHistory: ${showAllHistory})`);

  if (mealsToShow.length === 0) {
    mealList.innerHTML = '<p style="color: #aaa;">No meals for this view.</p>';
    return;
  }

  // Show most recent first
  const sorted = [...mealsToShow].reverse();
  
  sorted.forEach((meal, displayIndex) => {
    // Calculate actual index in user.meals array
    const actualIndex = user.meals.length - 1 - displayIndex;
    const row = buildMealRow(meal, actualIndex);
    mealList.appendChild(row);
  });

  console.log('Meals rendered successfully');
}

// Build meal row with edit/delete
function buildMealRow(meal, index) {
  const row = document.createElement('div');
  row.className = 'meal-row';

  const top = document.createElement('div');
  top.className = 'meal-topline';

  const info = document.createElement('div');
  info.className = 'meal-info';
  
  // Get meal type emoji
  const mealTypeEmojis = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍿'
  };
  const mealTypeLabel = meal.mealType ? `${mealTypeEmojis[meal.mealType]} ${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}` : '';
  
  // Display veggies with cups info
  const veggieDisplay = meal.veggieCups 
    ? `${meal.veggieCups}c (${meal.veggieGrams || 0}g, ${meal.veggieCalories || 0}cal)`
    : `${meal.veggies ?? 0} servings`;
  
  info.innerHTML = `
    <strong>${meal.name}</strong> ${mealTypeLabel ? `<span style="color: #8ecae6;">[${mealTypeLabel}]</span>` : ''} - ${meal.calories} cal (${meal.date})<br>
    <span class="meal-macros">
      P:${meal.protein ?? 0}g |
      C:${meal.carbs ?? 0}g |
      F:${meal.fat ?? 0}g |
      Sugar:${meal.sugar ?? 0}g |
      Veg:${veggieDisplay}
    </span>
  `;

  const actions = document.createElement('div');
  actions.className = 'meal-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'small-btn edit';
  editBtn.textContent = '✏️ Edit';
  editBtn.addEventListener('click', () => {
    showMealEditor(row, meal, index);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'small-btn delete';
  delBtn.textContent = '🗑 Delete';
  delBtn.addEventListener('click', () => {
    deleteMeal(index);
  });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  top.appendChild(info);
  top.appendChild(actions);

  row.appendChild(top);

  return row;
}

// Show inline editor
function showMealEditor(row, meal, index) {
  const existing = row.querySelector('.meal-edit-block');
  if (existing) existing.remove();

  const editor = document.createElement('div');
  editor.className = 'meal-edit-block';

  // Convert date string to YYYY-MM-DD format for date input
  const dateValue = toDateInputValue(meal.date);

  editor.innerHTML = `
    <div class="inline-grid-2col">
      <div>
        <label>Meal Name</label>
        <input type="text" class="editName" value="${meal.name}">
      </div>
      <div>
        <label>Calories</label>
        <input type="number" class="editCalories" value="${meal.calories}">
      </div>
    </div>

    <div style="margin-top:0.5rem;">
      <label>Meal Type</label>
      <div class="inline-grid-2col">
        <button type="button" class="meal-type-btn edit-meal-type" data-type="breakfast" ${meal.mealType === 'breakfast' ? 'data-selected="true"' : ''}>🌅 Breakfast</button>
        <button type="button" class="meal-type-btn edit-meal-type" data-type="lunch" ${meal.mealType === 'lunch' ? 'data-selected="true"' : ''}>☀️ Lunch</button>
        <button type="button" class="meal-type-btn edit-meal-type" data-type="dinner" ${meal.mealType === 'dinner' ? 'data-selected="true"' : ''}>🌙 Dinner</button>
        <button type="button" class="meal-type-btn edit-meal-type" data-type="snack" ${meal.mealType === 'snack' ? 'data-selected="true"' : ''}>🍿 Snack</button>
      </div>
    </div>

    <div class="inline-grid-2col" style="margin-top:0.5rem;">
      <div>
        <label>Date</label>
        <input type="date" class="editDate" value="${dateValue}">
      </div>
      <div>
        <label>Protein (g)</label>
        <input type="number" class="editProtein" value="${meal.protein ?? 0}">
      </div>
    </div>

    <div class="inline-grid-3col" style="margin-top:0.5rem;">
      <div>
        <label>Carbs (g)</label>
        <input type="number" class="editCarbs" value="${meal.carbs ?? 0}">
      </div>
      <div>
        <label>Fat (g)</label>
        <input type="number" class="editFat" value="${meal.fat ?? 0}">
      </div>
      <div>
        <label>Sugar (g)</label>
        <input type="number" class="editSugar" value="${meal.sugar ?? 0}">
      </div>
    </div>

    <div class="inline-grid-2col" style="margin-top:0.5rem;">
      <div>
        <label>Veggies (cups)</label>
        <input type="number" class="editVeggies" value="${meal.veggieCups ?? 0}" step="0.1">
        <span class="editVeggiesGrams" style="font-size: 0.8rem; color: #8ecae6; margin-top: 0.25rem; display: block;">≈ ${meal.veggieGrams || 0}g</span>
      </div>
    </div>

    <div class="inline-flex-end">
      <button class="small-btn save">Save</button>
      <button class="small-btn cancel">Cancel</button>
    </div>
  `;

  const saveBtn = editor.querySelector('.save');
  const cancelBtn = editor.querySelector('.cancel');
  const editMealTypeButtons = editor.querySelectorAll('.edit-meal-type');
  const editVeggiesInput = editor.querySelector('.editVeggies');
  const editVeggiesGramsDisplay = editor.querySelector('.editVeggiesGrams');
  
  // Track selected meal type for editing
  let editSelectedMealType = meal.mealType || null;
  
  // Update grams display when cups change
  if (editVeggiesInput && editVeggiesGramsDisplay) {
    editVeggiesInput.addEventListener('input', () => {
      const cups = parseFloat(editVeggiesInput.value) || 0;
      const grams = Math.round(cups * VEGGIE_CUPS_TO_GRAMS);
      editVeggiesGramsDisplay.textContent = `≈ ${grams}g`;
    });
  }
  
  // Set initial selected state
  editMealTypeButtons.forEach(btn => {
    if (btn.getAttribute('data-selected') === 'true') {
      btn.classList.add('selected');
    }
    
    // Add click handler
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mealType = btn.getAttribute('data-type');
      
      // Remove selected class from all buttons
      editMealTypeButtons.forEach(b => b.classList.remove('selected'));
      
      // Add selected class to clicked button
      btn.classList.add('selected');
      
      // Store selected meal type
      editSelectedMealType = mealType;
    });
  });

  saveBtn.addEventListener('click', () => {
    const newName = editor.querySelector('.editName').value.trim();
    const newCals = parseInt(editor.querySelector('.editCalories').value);
    const newDate = editor.querySelector('.editDate').value;
    const newProtein = parseFloat(editor.querySelector('.editProtein').value) || 0;
    const newCarbs = parseFloat(editor.querySelector('.editCarbs').value) || 0;
    const newFat = parseFloat(editor.querySelector('.editFat').value) || 0;
    const newSugar = parseFloat(editor.querySelector('.editSugar').value) || 0;
    const newVegCups = parseFloat(editor.querySelector('.editVeggies').value) || 0;

    if (!newName || isNaN(newCals)) {
      alert('Please enter a valid name and calories.');
      return;
    }

    // Calculate veggie data
    const veggieData = calculateVeggieServings(newVegCups, newCals);

    const user = profiles[currentUser];
    user.meals[index].name = newName;
    user.meals[index].calories = newCals;
    // Fix: Parse date properly to avoid timezone offset issues
    const [year, month, day] = newDate.split('-');
    user.meals[index].date = new Date(year, month - 1, day).toLocaleDateString();
    user.meals[index].protein = newProtein;
    user.meals[index].carbs = newCarbs;
    user.meals[index].fat = newFat;
    user.meals[index].sugar = newSugar;
    user.meals[index].veggies = veggieData.servings;
    user.meals[index].veggieCups = newVegCups;
    user.meals[index].veggieGrams = veggieData.grams;
    user.meals[index].veggieCalories = veggieData.calories;
    user.meals[index].mealType = editSelectedMealType;

    localStorage.setItem('profiles', JSON.stringify(profiles));
    renderMeals();
  });

  cancelBtn.addEventListener('click', () => {
    editor.remove();
  });

  row.appendChild(editor);
}

// Delete meal
function deleteMeal(index) {
  if (!confirm('Delete this meal?')) return;
  
  const user = profiles[currentUser];
  user.meals.splice(index, 1);
  localStorage.setItem('profiles', JSON.stringify(profiles));
  renderMeals();
}

// Toggle history view
if (toggleHistoryBtn) {
  toggleHistoryBtn.addEventListener('click', () => {
    showAllHistory = !showAllHistory;
    
    // Update button text and title
    if (showAllHistory) {
      toggleHistoryBtn.textContent = '📅 View Today Only';
      mealListTitle.textContent = 'All Meal History';
    } else {
      toggleHistoryBtn.textContent = '📅 View All History';
      mealListTitle.textContent = "Today's Meals";
    }
    
    // Re-render meals
    renderMeals();
  });
}

// Initial render
console.log('=== INITIAL RENDER ===');
renderMeals();
console.log('=== SETUP COMPLETE ===');
