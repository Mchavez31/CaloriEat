/********************************
 * STANDALONE ADD MEAL PAGE - WITH SUGAR TRACKING
 ********************************/

console.log('=== STANDALONE-MEAL.JS LOADED ===');

let currentUser = localStorage.getItem('currentUser') || null;
console.log('Current User:', currentUser);

let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
console.log('Profiles loaded:', Object.keys(profiles));

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
const addMealBtn = document.getElementById('addMealBtn');
const mealList = document.getElementById('mealList');
const foodSearch = document.getElementById('foodSearch');
const foodResults = document.getElementById('foodResults');

console.log('DOM Elements found:', {
  menuIcon: !!menuIcon,
  menuDropdown: !!menuDropdown,
  addMealBtn: !!addMealBtn,
  foodSearch: !!foodSearch,
  foodResults: !!foodResults,
  sugarInput: !!sugarInput
});

// Helper function
function todayStr() {
  return new Date().toLocaleDateString();
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
    console.log('=== ADD MEAL BUTTON CLICKED ===');
    e.preventDefault();
    
    const mealName = mealInput.value.trim();
    const mealCalories = parseInt(calInput.value);
    const mealProtein = parseFloat(proteinInput.value) || 0;
    const mealCarbs = parseFloat(carbsInput.value) || 0;
    const mealFat = parseFloat(fatInput.value) || 0;
    const mealSugar = parseFloat(sugarInput.value) || 0;
    const mealVeg = parseFloat(veggiesInput.value) || 0;

    console.log('Meal data:', { 
      mealName, 
      mealCalories, 
      mealProtein, 
      mealCarbs, 
      mealFat,
      mealSugar,
      mealVeg 
    });

    if (!mealName || isNaN(mealCalories) || mealCalories <= 0) {
      console.error('Validation failed');
      alert('Please enter a valid meal name and calories.');
      return;
    }

    console.log('Validation passed');

    // Ensure user profile exists
    if (!profiles[currentUser]) {
      console.log('Creating new profile for user');
      profiles[currentUser] = {
        username: currentUser,
        displayName: currentUser,
        password: '',
        meals: [],
        goal: { type: 'maintain', target: 2000 },
        weighIns: [],
        macroGoals: {
          proteinTarget: 150,
          carbsTarget: 200,
          fatTarget: 70,
          sugarTarget: 50,
          veggiesTarget: 5
        }
      };
    }

    // Add meal
    profiles[currentUser].meals.push({
      name: mealName,
      calories: mealCalories,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFat,
      sugar: mealSugar,
      veggies: mealVeg,
      date: todayStr()
    });

    console.log('Meal added to profile. Total meals:', profiles[currentUser].meals.length);

    // Save to localStorage
    try {
      localStorage.setItem('profiles', JSON.stringify(profiles));
      console.log('Saved to localStorage successfully');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      alert('Error saving meal: ' + error.message);
      return;
    }

    // Clear inputs
    mealInput.value = '';
    calInput.value = '';
    proteinInput.value = '';
    carbsInput.value = '';
    fatInput.value = '';
    sugarInput.value = '';
    veggiesInput.value = '';

    console.log('Inputs cleared');

    // Re-render meals
    renderMeals();
    
    alert('Meal added successfully!');
    console.log('=== ADD MEAL COMPLETE ===');
  });
} else {
  console.error('addMealBtn element not found!');
}

// Render meals list
function renderMeals() {
  console.log('=== RENDERING MEALS ===');
  const user = profiles[currentUser];
  if (!user) {
    console.error('User not found in profiles');
    return;
  }

  mealList.innerHTML = '';

  const today = todayStr();
  console.log('Today:', today);
  
  const todayMeals = (user.meals || []).filter(meal => meal.date === today);
  console.log('Today\'s meals:', todayMeals.length);

  if (todayMeals.length === 0) {
    mealList.innerHTML = '<p style="color: #aaa; text-align: center; padding: 1rem;">No meals added today.</p>';
    return;
  }

  todayMeals.forEach((meal, index) => {
    const actualIndex = user.meals.findIndex(m => m === meal);
    const row = buildMealRow(meal, actualIndex);
    mealList.appendChild(row);
  });
  
  console.log('Meals rendered');
}

// Build meal row with edit/delete
function buildMealRow(meal, index) {
  const row = document.createElement('div');
  row.className = 'meal-row';

  const top = document.createElement('div');
  top.className = 'meal-topline';

  const info = document.createElement('div');
  info.className = 'meal-info';
  info.innerHTML = `
    <strong>${meal.name}</strong> - ${meal.calories} cal (${meal.date})<br>
    <span class="meal-macros">
      P:${meal.protein ?? 0}g |
      C:${meal.carbs ?? 0}g |
      F:${meal.fat ?? 0}g |
      Sugar:${meal.sugar ?? 0}g |
      Veg:${meal.veggies ?? 0}
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

    <div class="inline-grid-3col" style="margin-top:0.5rem;">
      <div>
        <label>Protein (g)</label>
        <input type="number" class="editProtein" value="${meal.protein ?? 0}">
      </div>
      <div>
        <label>Carbs (g)</label>
        <input type="number" class="editCarbs" value="${meal.carbs ?? 0}">
      </div>
      <div>
        <label>Fat (g)</label>
        <input type="number" class="editFat" value="${meal.fat ?? 0}">
      </div>
    </div>

    <div class="inline-grid-2col" style="margin-top:0.5rem;">
      <div>
        <label>Sugar (g)</label>
        <input type="number" class="editSugar" value="${meal.sugar ?? 0}">
      </div>
      <div>
        <label>Veggies (servings)</label>
        <input type="number" class="editVeggies" value="${meal.veggies ?? 0}">
      </div>
    </div>

    <div class="inline-flex-end">
      <button class="small-btn save">Save</button>
      <button class="small-btn cancel">Cancel</button>
    </div>
  `;

  const saveBtn = editor.querySelector('.save');
  const cancelBtn = editor.querySelector('.cancel');

  saveBtn.addEventListener('click', () => {
    const newName = editor.querySelector('.editName').value.trim();
    const newCals = parseInt(editor.querySelector('.editCalories').value);
    const newProtein = parseFloat(editor.querySelector('.editProtein').value) || 0;
    const newCarbs = parseFloat(editor.querySelector('.editCarbs').value) || 0;
    const newFat = parseFloat(editor.querySelector('.editFat').value) || 0;
    const newSugar = parseFloat(editor.querySelector('.editSugar').value) || 0;
    const newVeg = parseFloat(editor.querySelector('.editVeggies').value) || 0;

    if (!newName || isNaN(newCals)) {
      alert('Please enter a valid name and calories.');
      return;
    }

    const user = profiles[currentUser];
    user.meals[index].name = newName;
    user.meals[index].calories = newCals;
    user.meals[index].protein = newProtein;
    user.meals[index].carbs = newCarbs;
    user.meals[index].fat = newFat;
    user.meals[index].sugar = newSugar;
    user.meals[index].veggies = newVeg;

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

// Initial render
console.log('=== INITIAL RENDER ===');
renderMeals();
console.log('=== SETUP COMPLETE ===');