<template>
    <div class="filter-popup-overlay">
      <div class="filter-popup">
        <div class="filter-popup-header">
          <h3>Filters</h3>
          <button @click="closePopup" class="close-button">×</button>
        </div>

        <div class="filter-content">
          <!-- Property type section -->
          <div class="filter-section">
            <h4>Property type</h4>
            <div class="filter-option">
              <input type="checkbox" id="all-types" v-model="filters.allTypes">
              <label for="all-types">All types</label>
            </div>
            <div class="filter-option">
              <input type="checkbox" id="house" v-model="filters.house">
              <label for="house">House</label>
            </div>
            <div class="filter-option">
              <input type="checkbox" id="townhouse" v-model="filters.townhouse">
              <label for="townhouse">Townhouse</label>
            </div>
            <div class="filter-option">
              <input type="checkbox" id="apartment" v-model="filters.apartment">
              <label for="apartment">Apartment & Unit</label>
            </div>
            <div class="filter-option">
              <input type="checkbox" id="villa" v-model="filters.villa">
              <label for="villa">Villa</label>
            </div>
          </div>

          <!-- Price section -->
          <div class="filter-section">
            <h4>Price</h4>
            <div class="price-range">
              <div class="price-field">
                <label for="min-price">Min</label>
                <div class="custom-select" @click="toggleMinPriceDropdown">
                  <div class="selected-option">{{ filters.minPrice || 'Any' }}</div>
                  <span class="dropdown-arrow">▼</span>

                  <div class="dropdown-menu" v-if="showMinPriceDropdown">
                    <div class="dropdown-item" @click="selectMinPrice('Any')">Any</div>
                    <div class="dropdown-item" @click="selectMinPrice('$50')">$50</div>
                    <div class="dropdown-item" @click="selectMinPrice('$75')">$75</div>
                    <div class="dropdown-item" @click="selectMinPrice('$100')">$100</div>
                    <div class="dropdown-item" @click="selectMinPrice('$125')">$125</div>
                    <div class="dropdown-item" @click="selectMinPrice('$150')">$150</div>
                    <div class="dropdown-item" @click="selectMinPrice('$175')">$175</div>
                    <div class="dropdown-item" @click="selectMinPrice('$200')">$200</div>
                    <!-- Add more price options here -->
                  </div>
                </div>
              </div>

              <div class="price-field">
                <label for="max-price">Max</label>
                <div class="custom-select">
                  <div class="selected-option">{{ filters.maxPrice || 'Any' }}</div>
                  <span class="dropdown-arrow">▼</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bedrooms section -->
          <div class="filter-section">
            <h4>Bedrooms</h4>
            <div class="price-range">
              <div class="price-field">
                <label for="min-bedrooms">Min</label>
                <div class="custom-select" @click="toggleMinBedroomsDropdown">
                  <div class="selected-option">{{ filters.minBedrooms || 'Any' }}</div>
                  <span class="dropdown-arrow">▼</span>

                  <div class="dropdown-menu" v-if="showMinBedroomsDropdown">
                    <div class="dropdown-item" @click="selectMinBedrooms('Any')">Any</div>
                    <div class="dropdown-item" @click="selectMinBedrooms('Studio')">Studio</div>
                    <div class="dropdown-item" @click="selectMinBedrooms('1')">1</div>
                    <div class="dropdown-item" @click="selectMinBedrooms('2')">2</div>
                    <div class="dropdown-item" @click="selectMinBedrooms('3')">3</div>
                    <div class="dropdown-item" @click="selectMinBedrooms('4')">4</div>
                    <div class="dropdown-item" @click="selectMinBedrooms('5')">5</div>
                  </div>
                </div>
              </div>

              <div class="price-field">
                <label for="max-bedrooms">Max</label>
                <div class="custom-select">
                  <div class="selected-option">{{ filters.maxBedrooms || 'Any' }}</div>
                  <span class="dropdown-arrow">▼</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bathrooms section -->
          <div class="filter-section">
            <h4>Bathrooms</h4>
            <div class="custom-select" @click="toggleBathroomsDropdown">
              <div class="selected-option">{{ filters.bathrooms || 'Any' }}</div>
              <span class="dropdown-arrow">▼</span>

              <div class="dropdown-menu" v-if="showBathroomsDropdown">
                <div class="dropdown-item" @click="selectBathrooms('Any')">Any</div>
                <div class="dropdown-item" @click="selectBathrooms('1+')">1+</div>
                <div class="dropdown-item" @click="selectBathrooms('2+')">2+</div>
                <div class="dropdown-item" @click="selectBathrooms('3+')">3+</div>
                <div class="dropdown-item" @click="selectBathrooms('4+')">4+</div>
              </div>
            </div>
          </div>

          <!-- Car spaces section -->
          <div class="filter-section">
            <h4>Car spaces</h4>
            <div class="custom-select" @click="toggleCarSpacesDropdown">
              <div class="selected-option">{{ filters.carSpaces || 'Any' }}</div>
              <span class="dropdown-arrow">▼</span>

              <div class="dropdown-menu" v-if="showCarSpacesDropdown">
                <div class="dropdown-item" @click="selectCarSpaces('Any')">Any</div>
                <div class="dropdown-item" @click="selectCarSpaces('1+')">1+</div>
                <div class="dropdown-item" @click="selectCarSpaces('2+')">2+</div>
                <div class="dropdown-item" @click="selectCarSpaces('3+')">3+</div>
                <div class="dropdown-item" @click="selectCarSpaces('4+')">4+</div>
                <div class="dropdown-item" @click="selectCarSpaces('5+')">5+</div>
              </div>
            </div>
          </div>

          <!-- Available Date section -->
          <div class="filter-section">
            <h4>Available Date</h4>
            <div class="custom-select" @click="toggleAvailableDateDropdown">
              <div class="selected-option">{{ filters.availableDate || 'Any' }}</div>
              <span class="dropdown-arrow">▼</span>

              <div class="dropdown-menu" v-if="showAvailableDateDropdown">
                <div class="dropdown-item" @click="selectAvailableDate('Any')">Any</div>
                <div class="dropdown-item" @click="selectAvailableDate('Avail. now')">Avail. now</div>
                <div class="dropdown-item" @click="selectAvailableDate('Before Fri 9 May')">Before Fri 9 May</div>
                <div class="dropdown-item" @click="selectAvailableDate('Before Sat 10 May')">Before Sat 10 May</div>
                <div class="dropdown-item" @click="selectAvailableDate('Before Sun 11 May')">Before Sun 11 May</div>
                <div class="dropdown-item" @click="selectAvailableDate('Before Mon 12 May')">Before Mon 12 May</div>
              </div>
            </div>
          </div>

          <!-- Property requirements section -->
          <div class="filter-section">
            <h4>Property requirements</h4>
            <div class="filter-option">
              <input type="checkbox" id="furnished" v-model="filters.furnished">
              <label for="furnished">Furnished</label>
            </div>
            <div class="filter-option">
              <input type="checkbox" id="pets" v-model="filters.petsConsidered">
              <label for="pets">Pets considered</label>
            </div>
          </div>

          <!-- Features section -->
          <div class="filter-section">
            <h4>Property features</h4>
            <div class="features-input">
              <input
                type="text"
                placeholder="Air con, pool, garage, solar, ensuite..."
                class="features-search"
                v-model="filters.keywords"
              >
              <p class="features-hint">Add specific property features to your search</p>
            </div>
          </div>

          <!-- Other options section -->
          <div class="filter-section">
            <h4>Other options</h4>
            <div class="filter-option">
              <input type="checkbox" id="deposit" v-model="filters.excludeDeposit">
              <label for="deposit">Exclude properties secured by a deposit</label>
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <button @click="clearFilters" class="clear-button">Clear filters</button>
          <button @click="applyFilters" class="search-button">Search</button>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, reactive } from 'vue'

  const props = defineProps({
    initialFilters: {
      type: Object,
      default: () => ({})
    }
  })

  const emit = defineEmits(['close', 'apply-filters'])

  // Dropdown states
  const showMinPriceDropdown = ref(false)
  const showMinBedroomsDropdown = ref(false)
  const showBathroomsDropdown = ref(false)
  const showCarSpacesDropdown = ref(false)
  const showAvailableDateDropdown = ref(false)

  const filters = reactive({
    allTypes: true,
    house: false,
    townhouse: false,
    apartment: false,
    villa: false,
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    bathrooms: '',
    carSpaces: '',
    availableDate: '',
    furnished: false,
    petsConsidered: false,
    keywords: '',
    excludeDeposit: false,
    ...props.initialFilters // Apply any initial filters passed in
  })

  function closePopup() {
    emit('close')
  }

  // Toggle dropdown states
  function toggleMinPriceDropdown() {
    showMinPriceDropdown.value = !showMinPriceDropdown.value
    showMinBedroomsDropdown.value = false
    showBathroomsDropdown.value = false
    showCarSpacesDropdown.value = false
    showAvailableDateDropdown.value = false
  }

  function toggleMinBedroomsDropdown() {
    showMinBedroomsDropdown.value = !showMinBedroomsDropdown.value
    showMinPriceDropdown.value = false
    showBathroomsDropdown.value = false
    showCarSpacesDropdown.value = false
    showAvailableDateDropdown.value = false
  }

  function toggleBathroomsDropdown() {
    showBathroomsDropdown.value = !showBathroomsDropdown.value
    showMinPriceDropdown.value = false
    showMinBedroomsDropdown.value = false
    showCarSpacesDropdown.value = false
    showAvailableDateDropdown.value = false
  }

  function toggleCarSpacesDropdown() {
    showCarSpacesDropdown.value = !showCarSpacesDropdown.value
    showMinPriceDropdown.value = false
    showMinBedroomsDropdown.value = false
    showBathroomsDropdown.value = false
    showAvailableDateDropdown.value = false
  }

  function toggleAvailableDateDropdown() {
    showAvailableDateDropdown.value = !showAvailableDateDropdown.value
    showMinPriceDropdown.value = false
    showMinBedroomsDropdown.value = false
    showBathroomsDropdown.value = false
    showCarSpacesDropdown.value = false
  }

  // Selection functions
  function selectMinPrice(value) {
    filters.minPrice = value
    showMinPriceDropdown.value = false
  }

  function selectMinBedrooms(value) {
    filters.minBedrooms = value
    showMinBedroomsDropdown.value = false
  }

  function selectBathrooms(value) {
    filters.bathrooms = value
    showBathroomsDropdown.value = false
  }

  function selectCarSpaces(value) {
    filters.carSpaces = value
    showCarSpacesDropdown.value = false
  }

  function selectAvailableDate(value) {
    filters.availableDate = value
    showAvailableDateDropdown.value = false
  }

  function clearFilters() {
    Object.assign(filters, {
      allTypes: true,
      house: false,
      townhouse: false,
      apartment: false,
      villa: false,
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      maxBedrooms: '',
      bathrooms: '',
      carSpaces: '',
      availableDate: '',
      furnished: false,
      petsConsidered: false,
      keywords: '',
      excludeDeposit: false
    })
  }

  function applyFilters() {
    // Create a search object with all the filter parameters
    const searchParams = {
      propertyTypes: getSelectedPropertyTypes(),
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBedrooms: filters.minBedrooms,
      maxBedrooms: filters.maxBedrooms,
      bathrooms: filters.bathrooms,
      carSpaces: filters.carSpaces,
      availableDate: filters.availableDate,
      furnished: filters.furnished,
      petsConsidered: filters.petsConsidered,
      keywords: filters.keywords,
      excludeDeposit: filters.excludeDeposit
    }

    emit('apply-filters', searchParams)
  }

  function getSelectedPropertyTypes() {
    if (filters.allTypes) return ['all']

    const types = []
    if (filters.house) types.push('house')
    if (filters.townhouse) types.push('townhouse')
    if (filters.apartment) types.push('apartment')
    if (filters.villa) types.push('villa')

    return types.length ? types : ['all'] // Default to 'all' if nothing selected
  }
  </script>

  <style>
  /* Filter Popup Styles */
  .filter-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .filter-popup {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 0;
    position: relative;
  }

  .filter-popup-header {
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem;
    position: relative;
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .filter-popup-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    position: absolute;
    right: 1rem;
    top: 1rem;
  }

  .filter-content {
    padding: 0 1rem;
    overflow-y: auto;
  }

  .filter-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .filter-section:last-child {
    border-bottom: none;
  }

  .filter-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #111827;
  }

  .filter-option {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .filter-option input[type="checkbox"] {
    margin-right: 0.5rem;
  }

  .price-range {
    display: flex;
    gap: 1rem;
  }

  .price-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .price-field label {
    font-weight: 500;
    color: #4b5563;
  }

  .custom-select {
    position: relative;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    user-select: none;
    background-color: white;
  }

  .selected-option {
    padding-right: 1.5rem;
  }

  .dropdown-arrow {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.75rem;
    color: #6b7280;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .dropdown-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .dropdown-item:hover {
    background-color: #f3f4f6;
  }

  .property-requirements {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .features-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .features-search {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
  }

  .features-hint {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
  }

  .filter-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background-color: white;
    position: sticky;
    bottom: 0;
    z-index: 10;
  }

  .clear-button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 1rem;
  }

  .search-button {
    background-color: #d32f2f;
    color: white;
    border: none;
    border-radius: 0.375rem;
    padding: 0.75rem 2rem;
    font-weight: 500;
    cursor: pointer;
  }

  @media (max-width: 640px) {
    .price-range {
      flex-direction: column;
    }
  }
  </style>