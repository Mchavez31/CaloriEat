/********************************
 * STATE
 ********************************/
let currentUser = null;
let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
let userGoal = { type: 'maintain', target: 2000 };

const foodDB = [
  { name: 'Apple', calories: 95 }, { name: 'Banana', calories: 105 },
  { name: 'Chicken Breast', calories: 165 }, { name: 'Rice (1 cup)', calories: 206 },
  { name: 'Egg', calories: 78 }, { name: 'Burger', calories: 354 },
  { name: 'Salad', calories: 150 }, { name: 'Steak', calories: 679 }
];

/********************************
 * DOM ELEMENTS
 ********************************/
const sections = {
  login: document.getElementById('loginSection'),
  profile: document.getElementById('profileSection'),
  app: document.getElementById('appSection'),
  dashboard: document.getElementById('dashboardSection'),
  account: document.getElementById('accountSection'),
  help: document.getElementById('helpSection'),
  contact: document.getElementById('contactSection')
};

// nav/menu
const menuIcon = document.getElementById('menuIcon');
const menuDropdown = document.getElementById('menuDropdown');
const menuHome = document.getElementById('menuHome');
const menuDashboard = document.getElementById('menuDashboard');
const menuAccount = document.getElementById('menuAccount');
const menuHelp = document.getElementById('menuHelp');
const menuContact = document.getElementById('menuContact');
const menuLogout = document.getElementById('menuLogout');

// login
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorPopup = document.getElementById('errorPopup');

// forgot/reset
const forgotLink = document.getElementById('forgotLink');
const resetPopup = document.getElementById('resetPopup');
const closeResetPopup = document.getElementById('closeResetPopup');
const resetLink = document.getElementById('resetLink');

// signup
const signUpLink = document.getElementById('signUpLink');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const setupUsername = document.getElementById('setupUsername');
const setupEmail = document.getElementById('setupEmail');
const setupPassword = document.getElementById('setupPassword');
const birthdateSignup = document.getElementById('birthdateSignup');
const heightFtInInput = document.getElementById('heightFtIn');
const weightLbsInput = document.getElementById('weightLbs');
const genderInput = document.getElementById('gender'); // "gender" after rename
const signupErrorBox = document.getElementById('signupError');
const backToLoginLink = document.getElementById('backToLoginLink');

// app/home
const welcomeMsg = document.getElementById('welcomeMsg');
const goalSelect = document.getElementById('goal');
const targetCaloriesInput = document.getElementById('targetCalories');
const saveGoalBtn = document.getElementById('saveGoalBtn');

// macro targets
const proteinTargetInput = document.getElementById('proteinTarget');
const carbsTargetInput = document.getElementById('carbsTarget');
const fatTargetInput = document.getElementById('fatTarget');
const veggiesTargetInput = document.getElementById('veggiesTarget');
const saveTargetsBtn = document.getElementById('saveTargetsBtn');

// meal inputs
const mealInput = document.getElementById('meal');
const calInput = document.getElementById('calories');
const proteinInput = document.getElementById('protein');
const carbsInput = document.getElementById('carbs');
const fatInput = document.getElementById('fat');
const veggiesInput = document.getElementById('veggies');
const addMealBtn = document.getElementById('addMealBtn');
const mealList = document.getElementById('mealList');

// summary
const totalCalories = document.getElementById('totalCalories');
const remainingCalories = document.getElementById('remainingCalories');
const goalDisplay = document.getElementById('goalDisplay');
const userDisplay = document.getElementById('userDisplay');
const profileDisplay = document.getElementById('profileDisplay');

// weigh in
const weighInLbsInput = document.getElementById('weighInLbs');
const addWeighInBtn = document.getElementById('addWeighInBtn');

// food search
const foodSearch = document.getElementById('foodSearch');
const foodResults = document.getElementById('foodResults');

// contact
const sendMessageBtn = document.getElementById('sendMessageBtn');

// header action links
const linkGoals = document.getElementById('linkGoals');
const linkMeals = document.getElementById('linkMeals');
const linkWeighIn = document.getElementById('linkWeighIn');

// dashboard rings + text
const ringCaloriesCanvas = document.getElementById('ringCalories');
const ringProteinCanvas = document.getElementById('ringProtein');
const ringCarbsCanvas = document.getElementById('ringCarbs');
const ringFatCanvas = document.getElementById('ringFat');
const ringVeggiesCanvas = document.getElementById('ringVeggies');

const ringCaloriesText = document.getElementById('ringCaloriesText');
const ringProteinText = document.getElementById('ringProteinText');
const ringCarbsText = document.getElementById('ringCarbsText');
const ringFatText = document.getElementById('ringFatText');
const ringVeggiesText = document.getElementById('ringVeggiesText');

// account form
const acctDisplayNameInput = document.getElementById('acctDisplayName');
const acctEmailInput = document.getElementById('acctEmail');
const acctBirthdateInput = document.getElementById('acctBirthdate');
const acctHeightInput = document.getElementById('acctHeightFtIn');
const acctWeightInput = document.getElementById('acctWeightLbs');
const acctGenderInput = document.getElementById('acctGender');
const saveAccountBtn = document.getElementById('saveAccountBtn');
const clearDataBtn = document.getElementById('clearDataBtn');

/********************************
 * MENU VISIBILITY HELPER
 ********************************/
function updateMenuVisibility() {
  const loggedIn = !!currentUser;

  const menuIconEl = document.getElementById('menuIcon');
  const menuDropdownEl = document.getElementById('menuDropdown');
  const headerLinksRow = document.querySelector('.header-links-row');

  // Show/hide hamburger icon
  if (menuIconEl) {
    menuIconEl.style.display = loggedIn ? "block" : "none";
  }

  // Always keep dropdown hidden until user clicks the icon
  if (menuDropdownEl) {
    menuDropdownEl.style.display = "none";
  }

  // Show/hide the three header links ("Set Goals", "Add Meals", "Weigh In")
  if (headerLinksRow) {
    headerLinksRow.style.display = loggedIn ? "flex" : "none";
  }

  // Show/hide Account and Logout in dropdown
  if (menuAccount) menuAccount.style.display = loggedIn ? "block" : "none";
  if (menuLogout)  menuLogout.style.display = loggedIn ? "block" : "none";
}

/********************************
 * GENERAL HELPERS
 ********************************/
function showSection(sectionEl) {
  Object.values(sections).forEach(s => s.classList.add('hidden'));
  sectionEl.classList.remove('hidden');
  if (menuDropdown) menuDropdown.style.display = 'none';
}

function clearProfileSetupFields() {
  setupUsername.value = '';
  setupEmail.value = '';
  setupPassword.value = '';
  birthdateSignup.value = '';
  heightFtInInput.value = '';
  weightLbsInput.value = '';
  if (genderInput) genderInput.selectedIndex = 0;
}

// parse height like 6'1", 6 1, or 72
function parseHeightFtIn(raw) {
  if (!raw) return null;
  let txt = raw.toLowerCase().trim();
  // normalize words to symbols
  txt = txt.replace(/feet|ft/g, "'");        
  txt = txt.replace(/inches|inch|in/g, '"');
  txt = txt.replace(/\s+/g, ' ');

  // patterns:
  const mA = txt.match(/^(\d+)'[\s]?(\d+)"?$/);   // 6'1" or 6' 1"
  const mB = txt.match(/^(\d+)'$/);               // 6'
  const mC = txt.match(/^(\d+)\s+(\d+)$/);        // 6 1
  const mD = txt.match(/^(\d+)$/);                // 72

  if (mA) {
    const feet = +mA[1];
    const inches = +mA[2];
    return { feet, inches, totalInches: feet * 12 + inches };
  }
  if (mB) {
    const feet = +mB[1];
    return { feet, inches: 0, totalInches: feet * 12 };
  }
  if (mC) {
    const feet = +mC[1];
    const inches = +mC[2];
    return { feet, inches, totalInches: feet * 12 + inches };
  }
  if (mD) {
    const totalInches = +mD[1];
    return {
      feet: Math.floor(totalInches / 12),
      inches: totalInches % 12,
      totalInches
    };
  }
  return null;
}

function formatHeightDisplay(hObj) {
  if (!hObj) return 'N/A';
  return `${hObj.feet}'${hObj.inches}"`;
}

function todayStr() {
  return new Date().toLocaleDateString();
}

/********************************
 * NAV MENU EVENTS
 ********************************/
if (menuIcon) {
  menuIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!menuDropdown) return;
    menuDropdown.style.display =
      (menuDropdown.style.display === 'block') ? 'none' : 'block';
  });
}

// close dropdown if you click outside
document.addEventListener('click', () => {
  if (menuDropdown) menuDropdown.style.display = 'none';
});

if (menuHome) {
  menuHome.addEventListener('click', () => {
    showApp(); // dashboard is now home
    if (menuDropdown) menuDropdown.style.display = 'none';
  });
}

if (menuDashboard) {
  menuDashboard.addEventListener('click', () => {
    showApp();
    if (menuDropdown) menuDropdown.style.display = 'none';
  });
}

if (menuAccount) {
  menuAccount.addEventListener('click', () => {
    showSection(sections.account);
    loadAccountForm();
    if (menuDropdown) menuDropdown.style.display = 'none';
  });
}

if (menuHelp) {
  menuHelp.addEventListener('click', () => {
    showSection(sections.help);
    if (menuDropdown) menuDropdown.style.display = 'none';
  });
}

if (menuContact) {
  menuContact.addEventListener('click', () => {
    showSection(sections.contact);
    if (menuDropdown) menuDropdown.style.display = 'none';
  });
}

if (menuLogout) {
  menuLogout.addEventListener('click', () => {
    doLogout();
    if (menuDropdown) menuDropdown.style.display = 'none';
  });
}

// "Set Goals" in the blue header
if (linkGoals) {
  linkGoals.addEventListener('click', () => {
    showSection(sections.app);
    loadTargetsUI();
  });
}

// "Add Meals" in the blue header
if (linkMeals) {
  linkMeals.addEventListener('click', () => {
    showSection(sections.app);
    renderMeals();
  });
}

// "Weigh In" in the blue header
if (linkWeighIn) {
  linkWeighIn.addEventListener('click', () => {
    showSection(sections.app);
    renderMeals();
  });
}

/********************************
 * AUTH / SIGNUP / PROFILE
 ********************************/
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const pwd = passwordInput.value;

    if (profiles[username] && profiles[username].password === pwd) {
      currentUser = username;
      localStorage.setItem('currentUser', currentUser);
      if (profiles[currentUser].goal) {
        userGoal = profiles[currentUser].goal;
      }
      showApp();               // go to Dashboard
      updateMenuVisibility();  // <-- make header visible
      return;
    }

    errorPopup.style.display = 'block';
    setTimeout(() => { errorPopup.style.display = 'none'; }, 2500);
  });
}

function doLogout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
  showSection(sections.login);
  updateMenuVisibility();   // <-- hide header
}

// forgot/reset popup
if (forgotLink) {
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (!resetPopup) return;
    resetPopup.classList.remove('hidden');
    resetPopup.style.display = 'block';
  });
}

if (closeResetPopup) {
  closeResetPopup.addEventListener('click', () => {
    resetPopup.classList.add('hidden');
    resetPopup.style.display = 'none';
  });
}

if (resetLink) {
  resetLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Reset flow not implemented in this demo.');
  });
}

// go to sign up
if (signUpLink) {
  signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    clearProfileSetupFields();
    showSection(sections.profile);
    updateMenuVisibility();
  });
}

// back to login from sign up
if (backToLoginLink) {
  backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(sections.login);
  });
}

// save profile on sign up
if (saveProfileBtn) {
  saveProfileBtn.addEventListener('click', () => {
    // reset error UI
    if (signupErrorBox) {
      signupErrorBox.style.display = 'none';
      signupErrorBox.textContent = '';
    }

    const username = setupUsername.value.trim();
    const email = setupEmail.value.trim();
    const pwd = setupPassword.value.trim();
    const birthdateVal = birthdateSignup.value.trim();
    const heightVal = heightFtInInput.value.trim();
    const weightVal = weightLbsInput.value.trim();
    const genderVal = genderInput ? genderInput.value : "";

    // Required fields
    if (!username || !email || !pwd) {
      if (signupErrorBox) {
        signupErrorBox.textContent = 'Please complete username, email, and password.';
        signupErrorBox.style.display = 'block';
      } else {
        alert('Please complete username, email, and password.');
      }
      return;
    }

    // Duplicate username
    if (profiles[username]) {
      if (signupErrorBox) {
        signupErrorBox.textContent = 'That username is already taken. Please choose a different one.';
        signupErrorBox.style.display = 'block';
      } else {
        alert('That username is already taken. Please choose a different one.');
      }
      return;
    }

    // Height format
    const parsedHeight = parseHeightFtIn(heightVal);
    if (!parsedHeight) {
      if (signupErrorBox) {
        signupErrorBox.textContent = "Please enter height like 6'1\", 5 11, or 62 for 6'2\".";
        signupErrorBox.style.display = 'block';
      } else {
        alert("Please enter height like 6'1\", 5 11, or 62 for 6'2\".");
      }
      return;
    }

    // Create profile
    profiles[username] = {
      username,
      displayName: username,
      email,
      password: pwd,
      birthdate: birthdateVal || "",
      height: parsedHeight,
      weightLbs: weightVal ? parseFloat(weightVal) : null,
      gender: genderVal,
      goal: userGoal,
      meals: [],
      weighIns: weightVal
        ? [{ date: todayStr(), weightLbs: parseFloat(weightVal) }]
        : [],
      macroGoals: {
        proteinTarget: 150,
        carbsTarget: 200,
        fatTarget: 70,
        veggiesTarget: 5
      }
    };

    // Persist & login
    localStorage.setItem('profiles', JSON.stringify(profiles));
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);

    showApp();
    updateMenuVisibility();
  });
}

/********************************
 * ACCOUNT PAGE (UPDATE PROFILE)
 ********************************/
function loadAccountForm() {
  const u = profiles[currentUser];
  if (!u) return;

  acctDisplayNameInput.value = u.displayName || u.username || '';
  acctEmailInput.value = u.email || '';

  if (acctBirthdateInput) {
    acctBirthdateInput.value = u.birthdate || '';
  }

  acctHeightInput.value = u.height ? formatHeightDisplay(u.height) : '';
  acctWeightInput.value = (u.weightLbs !== undefined && u.weightLbs !== null)
    ? u.weightLbs
    : '';

  acctGenderInput.value = u.gender || 'male';
}

if (clearDataBtn) {
  clearDataBtn.addEventListener('click', () => {
    const u = profiles[currentUser];
    if (!u) {
      alert("You must be logged in.");
      return;
    }

    // wipe meals and weigh-ins, keep profile
    u.meals = [];
    u.weighIns = [];

    localStorage.setItem('profiles', JSON.stringify(profiles));
    alert("Your logged data has been cleared.");

    // send them home and refresh summary there
    showApp();
  });
}

if (saveAccountBtn) {
  saveAccountBtn.addEventListener('click', () => {
    const u = profiles[currentUser];
    if (!u) {
      alert("You must log in before updating your profile.");
      return;
    }

    // read values from Account form safely
    const newDisplayName = acctDisplayNameInput ? acctDisplayNameInput.value.trim() : "";
    const newEmail = acctEmailInput ? acctEmailInput.value.trim() : "";
    const newBirthdate = acctBirthdateInput ? acctBirthdateInput.value.trim() : "";
    const newHeightRaw = acctHeightInput ? acctHeightInput.value.trim() : "";
    const newWeight = acctWeightInput ? acctWeightInput.value.trim() : "";
    const newGender = acctGenderInput ? acctGenderInput.value : "";

    // --- height handling ---
    let updatedHeight = u.height;
    if (newHeightRaw !== "") {
      const parsedHeight = parseHeightFtIn(newHeightRaw);
      if (!parsedHeight) {
        alert("Please enter height like 6'1\", 5 11, or 62 for 6'2\".");
        return;
      }
      updatedHeight = parsedHeight;
    }

    // --- weight handling ---
    let updatedWeight = u.weightLbs;
    let newWeighInNeeded = false;
    if (newWeight !== "" && !isNaN(parseFloat(newWeight))) {
      const weightNum = parseFloat(newWeight);
      updatedWeight = weightNum;
      if (u.weightLbs !== weightNum) {
        newWeighInNeeded = true;
      }
    }

    // --- write updates ---
    u.displayName = newDisplayName || u.displayName || u.username;
    u.email = newEmail || u.email;
    u.birthdate = newBirthdate || u.birthdate || "";
    u.height = updatedHeight;
    u.weightLbs = updatedWeight;
    u.gender = newGender || u.gender;

    if (newWeighInNeeded) {
      if (!u.weighIns) u.weighIns = [];
      u.weighIns.push({
        date: todayStr(),
        weightLbs: updatedWeight
      });
    }

    // persist
    localStorage.setItem('profiles', JSON.stringify(profiles));

    alert('Profile updated.');

    // go back to Dashboard (now home) and refresh UI
    showApp();
    updateMenuVisibility();
  });
}

/********************************
 * GOALS & TARGETS
 ********************************/
if (saveGoalBtn) {
  saveGoalBtn.addEventListener('click', () => {
    const goalType = goalSelect.value;
    const target = parseInt(targetCaloriesInput.value);

    if (isNaN(target) || target <= 0) {
      alert('Enter valid calorie goal.');
      return;
    }

    userGoal = { type: goalType, target };

    if (currentUser && profiles[currentUser]) {
      profiles[currentUser].goal = userGoal;
      localStorage.setItem('profiles', JSON.stringify(profiles));
    }

    renderMeals();
  });
}

if (saveTargetsBtn) {
  saveTargetsBtn.addEventListener('click', () => {
    const pT = parseFloat(proteinTargetInput.value) || 0;
    const cT = parseFloat(carbsTargetInput.value)   || 0;
    const fT = parseFloat(fatTargetInput.value)     || 0;
    const vT = parseFloat(veggiesTargetInput.value) || 0;

    const u = profiles[currentUser];
    if (!u.macroGoals) u.macroGoals = {};
    u.macroGoals.proteinTarget = pT;
    u.macroGoals.carbsTarget = cT;
    u.macroGoals.fatTarget = fT;
    u.macroGoals.veggiesTarget = vT;

    localStorage.setItem('profiles', JSON.stringify(profiles));
    alert('Daily targets saved.');
  });
}

function loadTargetsUI() {
  const u = profiles[currentUser];
  if (!u) return;

  if (u.goal) {
    goalSelect.value = u.goal.type || 'maintain';
    targetCaloriesInput.value = u.goal.target || '';
  }

  if (!u.macroGoals) {
    proteinTargetInput.value = '';
    carbsTargetInput.value = '';
    fatTargetInput.value = '';
    veggiesTargetInput.value = '';
  } else {
    proteinTargetInput.value = u.macroGoals.proteinTarget || '';
    carbsTargetInput.value = u.macroGoals.carbsTarget || '';
    fatTargetInput.value = u.macroGoals.fatTarget || '';
    veggiesTargetInput.value = u.macroGoals.veggiesTarget || '';
  }
}

/********************************
 * ADD MEAL + WEIGH IN
 ********************************/
if (addMealBtn) {
  addMealBtn.addEventListener('click', () => {
    const mealName = mealInput.value.trim();
    const mealCalories = parseInt(calInput.value);
    const mealProtein = parseFloat(proteinInput.value) || 0;
    const mealCarbs   = parseFloat(carbsInput.value)   || 0;
    const mealFat     = parseFloat(fatInput.value)     || 0;
    const mealVeg     = parseFloat(veggiesInput.value) || 0;

    if (!mealName || isNaN(mealCalories)) {
      alert('Please enter valid meal info.');
      return;
    }

    if (!profiles[currentUser]) {
      profiles[currentUser] = {
        username: currentUser,
        displayName: currentUser,
        password: '',
        meals: [],
        goal: userGoal,
        weighIns: [],
        macroGoals: {}
      };
    }

    profiles[currentUser].meals.push({
      name: mealName,
      calories: mealCalories,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFat,
      veggies: mealVeg,
      date: todayStr()
    });

    localStorage.setItem('profiles', JSON.stringify(profiles));

    mealInput.value = '';
    calInput.value = '';
    proteinInput.value = '';
    carbsInput.value = '';
    fatInput.value = '';
    veggiesInput.value = '';

    renderMeals();
  });
}

if (addWeighInBtn) {
  addWeighInBtn.addEventListener('click', () => {
    const wVal = weighInLbsInput.value.trim();
    if (!wVal || isNaN(parseFloat(wVal))) {
      alert('Enter a valid weight in lbs.');
      return;
    }

    const user = profiles[currentUser];
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

    renderMeals();
  });
}

// Food search autofill
if (foodSearch) {
  foodSearch.addEventListener('input', () => {
    const query = foodSearch.value.toLowerCase();
    foodResults.innerHTML = '';
    if (query.length === 0) return;

    const results = foodDB.filter(f => f.name.toLowerCase().includes(query));
    results.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} - ${item.calories} cal`;
      li.style.cursor = 'pointer';
      li.style.fontSize = '0.9rem';
      li.addEventListener('click', () => {
        mealInput.value = item.name;
        calInput.value = item.calories;
        foodResults.innerHTML = '';
      });
      foodResults.appendChild(li);
    });
  });
}

/********************************
 * MEAL LIST: EDIT / DELETE
 ********************************/
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

    <div style="margin-top:0.5rem;">
      <label>Veggies (servings)</label>
      <input type="number" class="editVeggies" value="${meal.veggies ?? 0}">
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
    const newCarbs   = parseFloat(editor.querySelector('.editCarbs').value)   || 0;
    const newFat     = parseFloat(editor.querySelector('.editFat').value)     || 0;
    const newVeg     = parseFloat(editor.querySelector('.editVeggies').value) || 0;

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
    user.meals[index].veggies = newVeg;

    localStorage.setItem('profiles', JSON.stringify(profiles));
    renderMeals();
  });

  cancelBtn.addEventListener('click', () => {
    editor.remove();
  });

  row.appendChild(editor);
}

function deleteMeal(index) {
  const user = profiles[currentUser];
  user.meals.splice(index, 1);
  localStorage.setItem('profiles', JSON.stringify(profiles));
  renderMeals();
}

/********************************
 * SUMMARY RENDER
 ********************************/
function renderMeals() {
  const user = profiles[currentUser];
  if (!user) return;

  mealList.innerHTML = '';

  let total = 0;
  user.meals.forEach((meal, index) => {
    total += meal.calories;
    const row = buildMealRow(meal, index);
    mealList.appendChild(row);
  });

  const dailyTarget = (user.goal && user.goal.target) ? user.goal.target : 2000;
  const remaining = dailyTarget - total;

  totalCalories.textContent = `Total Calories: ${total}`;
  remainingCalories.textContent = `Remaining Calories: ${remaining}`;
  goalDisplay.textContent =
    `Goal: ${(user.goal && user.goal.type) ? user.goal.type : 'maintain'} (${dailyTarget} cal)`;

  const nameToShow = user.displayName || user.username || currentUser || 'User';
  if (welcomeMsg) {
    welcomeMsg.textContent = `Hello ${nameToShow}!`;
  }
  userDisplay.textContent = `Logged in as: ${nameToShow}`;

  const heightStr = user.height ? formatHeightDisplay(user.height) : 'N/A';
  const weightStr = (user.weightLbs !== undefined && user.weightLbs !== null)
    ? `${user.weightLbs} lbs`
    : 'N/A';

  // We removed "Age" here because birthdate -> age calc is not wired yet
  profileDisplay.textContent =
    `Height: ${heightStr} | Weight: ${weightStr}`;
}

/********************************
 * DASHBOARD RINGS
 ********************************/
function getDailyTargets(user) {
  const baseCalories = (user.goal && user.goal.target) ? user.goal.target : 2000;
  const mg = user.macroGoals || {};

  return {
    calories: baseCalories,
    protein: mg.proteinTarget || 150,
    carbs:   mg.carbsTarget   || 200,
    fat:     mg.fatTarget     || 70,
    veggies: mg.veggiesTarget || 5
  };
}

function getTodayTotals(user) {
  const today = todayStr();
  let totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    veggies: 0
  };

  (user.meals || []).forEach(m => {
    if (m.date === today) {
      totals.calories += m.calories || 0;
      totals.protein += m.protein || 0;
      totals.carbs   += m.carbs   || 0;
      totals.fat     += m.fat     || 0;
      totals.veggies += m.veggies || 0;
    }
  });

  return totals;
}

function drawRing(canvas, value, goal, unitLabel, labelEl) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const baseRadius = size / 2 - 8;
  const baseWidth = 10;

  ctx.clearRect(0, 0, size, size);

  // gray background ring
  ctx.beginPath();
  ctx.arc(center, center, baseRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = baseWidth;
  ctx.stroke();

  const safeGoal = goal > 0 ? goal : 1;
  const pctBase = Math.min(value / safeGoal, 1);
  const pctOver = value > safeGoal
    ? Math.min((value - safeGoal) / safeGoal, 1)
    : 0;

  const startAngle = -Math.PI / 2;
  const blueEndAngle = startAngle + pctBase * 2 * Math.PI;

  // base blue progress
  ctx.beginPath();
  ctx.arc(center, center, baseRadius, startAngle, blueEndAngle);
  ctx.lineWidth = baseWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1f6feb';
  ctx.stroke();

  // green halo if exceeded goal
  if (pctOver > 0) {
    const greenEndAngle = startAngle + pctOver * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(center, center, baseRadius + 3, startAngle, greenEndAngle);
    ctx.lineWidth = baseWidth - 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#00c853';
    ctx.stroke();
  }

  // text inside ring
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(unitLabel, center, center);

  if (labelEl) {
    labelEl.textContent = `${value} / ${goal}`;
  }
}

function renderDashboardRings() {
  const user = profiles[currentUser];
  if (!user) return;

  const targets = getDailyTargets(user);
  const totals = getTodayTotals(user);

  drawRing(
    ringCaloriesCanvas,
    totals.calories,
    targets.calories,
    `${totals.calories}`,
    ringCaloriesText
  );
  drawRing(
    ringProteinCanvas,
    totals.protein,
    targets.protein,
    `${totals.protein}g`,
    ringProteinText
  );
  drawRing(
    ringCarbsCanvas,
    totals.carbs,
    targets.carbs,
    `${totals.carbs}g`,
    ringCarbsText
  );
  drawRing(
    ringFatCanvas,
    totals.fat,
    targets.fat,
    `${totals.fat}g`,
    ringFatText
  );
  drawRing(
    ringVeggiesCanvas,
    totals.veggies,
    targets.veggies,
    `${totals.veggies}`,
    ringVeggiesText
  );
}

/********************************
 * CHARTS (Chart.js)
 ********************************/
function renderCharts() {
  const user = profiles[currentUser];
  if (!user) return;

  // calories per day bar
  const dailyTotals = {};
  (user.meals || []).forEach(meal => {
    dailyTotals[meal.date] = (dailyTotals[meal.date] || 0) + meal.calories;
  });
  const labels = Object.keys(dailyTotals);
  const caloriesData = Object.values(dailyTotals);

  const calCtx = document.getElementById('calorieChart').getContext('2d');
  new Chart(calCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Calories Per Day',
        data: caloriesData,
        backgroundColor: '#1f6feb'
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });

  // weight line chart
  const weightDates = [];
  const weightVals = [];
  if (user.weighIns && user.weighIns.length > 0) {
    user.weighIns.forEach(w => {
      weightDates.push(w.date);
      weightVals.push(w.weightLbs);
    });
  } else {
    weightDates.push(todayStr());
    weightVals.push(user.weightLbs || 0);
  }

  const wtCtx = document.getElementById('weightChart').getContext('2d');
  new Chart(wtCtx, {
    type: 'line',
    data: {
      labels: weightDates,
      datasets: [{
        label: 'Weight (lbs)',
        data: weightVals,
        borderColor: '#8ecae6',
        fill: false
      }]
    },
    options: {
      scales: { y: { beginAtZero: false } }
    }
  });
}

/********************************
 * CONTACT
 ********************************/
if (sendMessageBtn) {
  sendMessageBtn.addEventListener('click', () => {
    alert('Your message has been sent. Thank you!');
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
  });
}

/********************************
 * INIT / STARTUP
 ********************************/
function showApp() {
  // Dashboard is now the main / home view
  showSection(sections.dashboard);

  // load dashboard content
  renderMeals();          // summary on dashboard
  renderDashboardRings(); // rings
  renderCharts();         // charts

  // ensure header reflects logged-in state
  updateMenuVisibility();

  // keep targets in memory for other pages
  loadTargetsUI();
}

// Force start on login screen every time the page loads
currentUser = null;
localStorage.removeItem('currentUser');

showSection(sections.login);
updateMenuVisibility();
