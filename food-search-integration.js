/**
 * FOOD DATABASE SEARCH INTEGRATION
 * 
 * This file provides the complete search functionality for the CaloriEat app.
 * It includes:
 * - Loading the food database
 * - Searching foods by name/keywords
 * - Auto-filling the meal form
 * - Category detection
 * 
 * ADD THIS CODE TO YOUR standalone-meal.js or app.js file
 */

/********************************
 * FOOD DATABASE MANAGER
 ********************************/

const FoodDatabase = {
  foods: [],
  loaded: false,
  
  /**
   * Initialize and load the food database
   */
  async initialize() {
    try {
      console.log('Loading food database...');
      const response = await fetch('foods-database.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.foods = data.foods || [];
      this.loaded = true;
      
      console.log(`✓ Loaded ${this.foods.length} foods from database`);
      console.log(`✓ Categories: ${data.categories.join(', ')}`);
      
      return true;
    } catch (error) {
      console.error('Failed to load food database:', error);
      this.loaded = false;
      return false;
    }
  },
  
  /**
   * Search foods by query string
   * @param {string} query - Search term
   * @param {number} maxResults - Maximum results to return (default: 20)
   * @returns {Array} - Array of matching foods
   */
  search(query, maxResults = 20) {
    if (!this.loaded || !query) {
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
      return [];
    }
    
    // Search foods
    const results = this.foods.filter(food => {
      // Check food name
      if (food.name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Check keywords
      if (food.keywords && food.keywords.some(keyword => keyword.includes(searchTerm))) {
        return true;
      }
      
      // Check restaurant name
      if (food.restaurant && food.restaurant.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      return false;
    });
    
    // Sort results by relevance
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match first
      if (aName === searchTerm) return -1;
      if (bName === searchTerm) return 1;
      
      // Starts with match second
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
      
      // Alphabetical
      return aName.localeCompare(bName);
    });
    
    return results.slice(0, maxResults);
  },
  
  /**
   * Get food by ID
   * @param {number} id - Food ID
   * @returns {Object|null} - Food object or null
   */
  getById(id) {
    return this.foods.find(food => food.id === id) || null;
  },
  
  /**
   * Get foods by category
   * @param {string} category - Category name
   * @returns {Array} - Array of foods in category
   */
  getByCategory(category) {
    return this.foods.filter(food => food.category === category);
  },
  
  /**
   * Get all restaurant foods
   * @returns {Array} - Array of restaurant foods
   */
  getRestaurantFoods() {
    return this.foods.filter(food => food.restaurant);
  },
  
  /**
   * Get statistics about the database
   * @returns {Object} - Database statistics
   */
  getStats() {
    const stats = {
      total: this.foods.length,
      byCategory: {},
      restaurants: new Set()
    };
    
    this.foods.forEach(food => {
      // Count by category
      stats.byCategory[food.category] = (stats.byCategory[food.category] || 0) + 1;
      
      // Collect restaurant names
      if (food.restaurant) {
        stats.restaurants.add(food.restaurant);
      }
    });
    
    stats.restaurantCount = stats.restaurants.size;
    stats.restaurants = Array.from(stats.restaurants);
    
    return stats;
  }
};


/********************************
 * UI COMPONENTS
 ********************************/

/**
 * Create search UI for add-meal.html
 * Call this function when the page loads
 */
function createFoodSearchUI() {
  // Find the meal name input
  const mealInput = document.getElementById('meal');
  
  if (!mealInput) {
    console.error('Meal input not found');
    return;
  }
  
  // Create search container
  const searchContainer = document.createElement('div');
  searchContainer.id = 'foodSearchContainer';
  searchContainer.className = 'food-search-container';
  searchContainer.innerHTML = `
    <div class="food-search-header">
      <label for="foodSearchInput">🔍 Search Food Database <span class="food-search-status" id="foodSearchStatus">(Ready)</span></label>
    </div>
    <input 
      type="text" 
      id="foodSearchInput" 
      class="food-search-input"
      placeholder="🔍 Search food database OR type meal name"
      autocomplete="off"
    />
    <div id="foodSearchResults" class="food-search-results"></div>
    <div class="food-search-tip">💡 Tip: Search includes restaurant items from McDonald's, Subway, Chipotle, and more!</div>
  `;
  
  // Insert before the meal input
  mealInput.parentNode.insertBefore(searchContainer, mealInput);
  
  // Add CSS
  addFoodSearchCSS();
  
  // Setup event listeners
  setupFoodSearchListeners();
  
  console.log('✓ Food search UI created');
}

/**
 * Add CSS styles for food search
 */
function addFoodSearchCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .food-search-container {
      margin-bottom: 1.5rem;
    }
    
    .food-search-header {
      margin-bottom: 0.5rem;
    }
    
    .food-search-header label {
      color: #8ecae6;
      font-weight: bold;
      font-size: 0.95rem;
      display: block;
      width: 100%;
      margin-top: 0.5rem;
    }
    
    .food-search-status {
      font-size: 0.85rem;
      color: #06d6a0;
      font-weight: normal;
      margin-left: 0.5rem;
    }
    
    .food-search-input {
      display: block;
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      border-radius: 5px;
      color: #f0f0f0;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    
    .food-search-input:focus {
      outline: none;
      border-color: #8ecae6;
    }
    
    .food-search-results {
      max-height: 300px;
      overflow-y: auto;
      margin-top: 0.5rem;
      background: #2a2a2a;
      border-radius: 6px;
      display: none;
    }
    
    .food-search-results.active {
      display: block;
      border: 1px solid #444;
    }
    
    .food-result-item {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #333;
      cursor: pointer;
      transition: background 0.15s;
    }
    
    .food-result-item:last-child {
      border-bottom: none;
    }
    
    .food-result-item:hover {
      background: #3a3a3a;
    }
    
    .food-result-name {
      color: #fff;
      font-weight: 500;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }
    
    .food-result-restaurant {
      color: #ffb703;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }
    
    .food-result-category {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      background: #3a3a3a;
      border-radius: 12px;
      font-size: 0.75rem;
      color: #8ecae6;
      margin-right: 0.5rem;
    }
    
    .food-result-nutrition {
      color: #9e9e9e;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
    
    .food-search-tip {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #9e9e9e;
      font-style: italic;
      display: block;
      width: 100%;
    }
    
    .food-search-no-results {
      padding: 1rem;
      text-align: center;
      color: #9e9e9e;
      font-size: 0.9rem;
    }
    
    /* Category colors */
    .category-fruits { background: #f72585 !important; }
    .category-veggies { background: #06d6a0 !important; }
    .category-wholeGrains { background: #ffbe0b !important; }
    .category-leanProteins { background: #1f6feb !important; }
    .category-processedFoods { background: #fb5607 !important; }
    .category-sugaryFoods { background: #ff006e !important; }
  `;
  document.head.appendChild(style);
}

/**
 * Setup event listeners for food search
 */
function setupFoodSearchListeners() {
  const searchInput = document.getElementById('foodSearchInput');
  const resultsContainer = document.getElementById('foodSearchResults');
  const statusEl = document.getElementById('foodSearchStatus');
  
  if (!searchInput || !resultsContainer) {
    return;
  }
  
  let searchTimeout;
  
  // Search as user types
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      resultsContainer.classList.remove('active');
      resultsContainer.innerHTML = '';
      return;
    }
    
    // Debounce search
    searchTimeout = setTimeout(() => {
      performFoodSearch(query);
    }, 300);
  });
  
  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#foodSearchContainer')) {
      resultsContainer.classList.remove('active');
    }
  });
  
  // Update status when database loads
  if (FoodDatabase.loaded) {
    const stats = FoodDatabase.getStats();
    statusEl.textContent = `(${stats.total} foods available)`;
    statusEl.style.color = '#06d6a0';
  } else {
    statusEl.textContent = '(Loading...)';
    statusEl.style.color = '#ffb703';
  }
}

/**
 * Perform food search and display results
 * @param {string} query - Search query
 */
function performFoodSearch(query) {
  const resultsContainer = document.getElementById('foodSearchResults');
  
  if (!FoodDatabase.loaded) {
    resultsContainer.innerHTML = '<div class="food-search-no-results">Database not loaded yet...</div>';
    resultsContainer.classList.add('active');
    return;
  }
  
  const results = FoodDatabase.search(query, 15);
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="food-search-no-results">No foods found. Try a different search term.</div>';
    resultsContainer.classList.add('active');
    return;
  }
  
  // Build results HTML
  let html = '';
  results.forEach(food => {
    html += `
      <div class="food-result-item" data-food-id="${food.id}">
        <div class="food-result-name">${food.name}</div>
        ${food.restaurant ? `<div class="food-result-restaurant">📍 ${food.restaurant}</div>` : ''}
        <div>
          <span class="food-result-category category-${food.category}">${getCategoryDisplayName(food.category)}</span>
        </div>
        <div class="food-result-nutrition">
          ${Math.round(food.calories)} cal | 
          ${food.protein.toFixed(1)}g protein | 
          ${food.carbs.toFixed(1)}g carbs | 
          ${food.fat.toFixed(1)}g fat
        </div>
      </div>
    `;
  });
  
  resultsContainer.innerHTML = html;
  resultsContainer.classList.add('active');
  
  // Add click handlers
  resultsContainer.querySelectorAll('.food-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const foodId = parseInt(item.dataset.foodId);
      selectFood(foodId);
    });
  });
}

/**
 * Select a food and auto-fill the form
 * @param {number} foodId - Food ID
 */
function selectFood(foodId) {
  const food = FoodDatabase.getById(foodId);
  
  if (!food) {
    console.error('Food not found:', foodId);
    return;
  }
  
  console.log('Selected food:', food);
  
  // Fill in the form
  const mealInput = document.getElementById('meal');
  const caloriesInput = document.getElementById('calories');
  const proteinInput = document.getElementById('protein');
  const carbsInput = document.getElementById('carbs');
  const fatInput = document.getElementById('fat');
  const sugarInput = document.getElementById('sugar');
  
  if (mealInput) mealInput.value = food.name;
  if (caloriesInput) caloriesInput.value = Math.round(food.calories);
  if (proteinInput) proteinInput.value = food.protein.toFixed(1);
  if (carbsInput) carbsInput.value = food.carbs.toFixed(1);
  if (fatInput) fatInput.value = food.fat.toFixed(1);
  if (sugarInput) sugarInput.value = food.sugar.toFixed(1);
  
  // Close search results
  const resultsContainer = document.getElementById('foodSearchResults');
  if (resultsContainer) {
    resultsContainer.classList.remove('active');
  }
  
  // Clear search input
  const searchInput = document.getElementById('foodSearchInput');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Show success message
  showNotification(`✓ Auto-filled: ${food.name}`, 'success');
  
  // Log category for debugging
  console.log('Category:', food.category, '-', getCategoryDisplayName(food.category));
}

/**
 * Show a notification message
 * @param {string} message - Message to show
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `food-notification notification-${type}`;
  notification.textContent = message;
  
  // Add CSS if not already added
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .food-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: #2a2a2a;
        color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      }
      
      .notification-success {
        border-left: 4px solid #06d6a0;
      }
      
      .notification-error {
        border-left: 4px solid #fb5607;
      }
      
      .notification-info {
        border-left: 4px solid #8ecae6;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Get category display name
 * (This should match your existing function in app.js)
 */
function getCategoryDisplayName(category) {
  const names = {
    fruits: 'Fruits',
    veggies: 'Veggies',
    wholeGrains: 'Whole Grains',
    leanProteins: 'Lean Proteins',
    processedFoods: 'Processed Foods',
    sugaryFoods: 'Sugary Foods',
    other: 'Other'
  };
  return names[category] || 'Other';
}


/********************************
 * INITIALIZATION
 ********************************/

/**
 * Initialize the food database system
 * Call this when the page loads
 */
async function initializeFoodDatabase() {
  console.log('Initializing food database...');
  
  // Load database
  const loaded = await FoodDatabase.initialize();
  
  if (loaded) {
    const stats = FoodDatabase.getStats();
    console.log('✓ Database ready!');
    console.log('  - Total foods:', stats.total);
    console.log('  - Categories:', Object.keys(stats.byCategory).length);
    console.log('  - Restaurants:', stats.restaurantCount);
    console.log('  - Breakdown:', stats.byCategory);
    
    // Create search UI if on add-meal page
    if (document.getElementById('meal')) {
      createFoodSearchUI();
    }
  } else {
    console.error('✗ Failed to load database');
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFoodDatabase);
} else {
  initializeFoodDatabase();
}


/********************************
 * EXPORT FOR USE IN OTHER FILES
 ********************************/

// If using modules, export these
// export { FoodDatabase, selectFood, performFoodSearch, initializeFoodDatabase };
