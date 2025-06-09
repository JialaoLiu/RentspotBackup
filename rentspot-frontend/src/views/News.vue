<template>
  <div class="rental-news-page">
    <header class="header">
      <h1 class="site-title">Rental Hotspot</h1>
    </header>

    <main class="main-content">
      <h2 class="section-title">Latest Property & Rental News</h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading latest news...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchNews" class="retry-btn">Try Again</button>
      </div>

      <!-- News Articles -->
      <div v-else class="news-list">
        <article v-for="article in articles" :key="article.url" class="news-item">
          <div class="news-image" v-if="article.urlToImage">
            <img :src="article.urlToImage" :alt="article.title" @error="handleImageError" />
          </div>
          <div class="news-content">
            <h3 class="news-title">
              <a :href="article.url" target="_blank" rel="noopener noreferrer">
                {{ article.title }}
              </a>
            </h3>
            <p class="news-description">{{ article.description }}</p>
            <div class="news-meta">
              <span class="news-date">{{ formatDate(article.publishedAt) }}</span>
              <span class="news-separator">|</span>
              <span class="news-source">{{ article.source.name }}</span>
              <span class="news-separator" v-if="article.author">|</span>
              <span class="news-author" v-if="article.author">{{ article.author }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- No Articles Found -->
      <div v-if="!loading && !error && articles.length === 0" class="no-articles">
        <p>No property news articles found at the moment.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotification } from '../composables/useNotification'

const articles = ref([])
const loading = ref(false)
const error = ref(null)
const toast = useNotification()

// NewsAPI configuration
const NEWS_API_KEY = 'd9b129de2e5e432e8315073b3e294fc3'
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything'

// Original mock data
/*
const mockArticles = [
  {
    title: 'Australian Renters Face Pressure: Over 40% Forced to Offer More to Secure Homes',
    summary: 'Recent data shows that over half of Australian renters feel pressured in competitive markets and are forced to offer above asking prices to secure a rental property.',
    date: '2025-03-05',
    source: 'AUS Finance Watch',
  },
  {
    title: 'Rental Crisis Deepens: $130K Annual Salary Now Needed to Afford Rent',
    summary: 'According to a new report, the average Australian renter now needs to earn at least $130,000 per year to afford rent for a one-bedroom apartment nationwide.',
    date: '2025-03-21',
    source: 'SA Daily News',
  },
  {
    title: '"Only 2% of Rentals Are Affordable": The Toughest Rental Market in Years',
    summary: 'PropTrack\'s 2025 Rental Affordability Report finds that families earning the national median income of $116,000 can only afford 26% of available listings.',
    date: '2025-03-29',
    source: 'SA Daily News',
  },
  {
    title: 'Landlord Fined $4,500 Over Illegal Boarding House in Sydney',
    summary: 'A Sydney property was illegally converted into a shared accommodation by a landlord, who has now been fined $4,500 and ordered to correct safety violations.',
    date: '2025-05-02',
    source: 'Sohu News',
  },
  {
    title: 'Low-Income Households Face Rental Emergency in Australia',
    summary: 'As rental prices continue to surge, low-income Australians are struggling to find affordable housing, with rental affordability at an all-time low.',
    date: '2025-03-14',
    source: 'SA Daily News',
  },
];
*/

// Property/rental related keywords - broader coverage
const searchKeywords = [
  'property market Australia',
  'housing prices Australia',
  'real estate market',
  'rental market trends',
  'Australia housing crisis',
  'property investment Australia',
  'home prices rising',
  'rental affordability Australia',
  'property development Australia',
  'housing market forecast'
]

// Fallback news search with simpler criteria
const fetchFallbackNews = async () => {
  try {
    const fallbackSearches = [
      'Australia housing market',
      'Sydney property prices',
      'Melbourne rental market'
    ]
    
    const keyword = fallbackSearches[Math.floor(Math.random() * fallbackSearches.length)]
    
    console.log(`Fallback search: "${keyword}" (recent articles)`)
    
    const response = await fetch(`${NEWS_API_BASE_URL}?` + new URLSearchParams({
      q: keyword,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 30,
      apiKey: NEWS_API_KEY
    }))

    const data = await response.json()
    
    if (data.status === 'ok' && data.articles.length > 0) {
      // Less strict filtering for fallback
      const fallbackArticles = data.articles
        .filter(article => {
          if (!article.title || !article.description) return false
          const content = `${article.title} ${article.description}`.toLowerCase()
          return content.includes('property') || content.includes('housing') || content.includes('rent')
        })
        .slice(0, 10)
      
      articles.value = fallbackArticles
    }
    
    if (articles.value.length === 0) {
      error.value = 'No relevant property news found at the moment. Please try again later.'
    }
  } catch (err) {
    error.value = 'Unable to load property news. Please check your connection and try again.'
  }
}

const fetchNews = async () => {
  loading.value = true
  error.value = null

  try {
    // Use multiple keywords to get comprehensive coverage
    const keyword = searchKeywords[Math.floor(Math.random() * searchKeywords.length)]
    
    console.log(`Searching for: "${keyword}" (recent articles)`)
    
    const response = await fetch(`${NEWS_API_BASE_URL}?` + new URLSearchParams({
      q: keyword,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 50, // Get more articles to filter from
      apiKey: NEWS_API_KEY
    }))

    if (!response.ok) {
      throw new Error(`NewsAPI Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI returned an error')
    }

    console.log(`NewsAPI returned ${data.articles.length} total articles`)

    // Filter and process articles with relaxed property/rental criteria
    const filteredArticles = data.articles
      .filter(article => {
        // Filter out articles without title or description
        if (!article.title || !article.description) return false
        
        // Basic date validation - just ensure we have a valid date
        const articleDate = new Date(article.publishedAt)
        if (isNaN(articleDate.getTime())) {
          console.log(`Invalid date: ${article.publishedAt}`)
          return false
        }
        
        // Check for property/rental specific content
        const contentToCheck = `${article.title} ${article.description}`.toLowerCase()
        
        // Must have at least one property-related keyword (more relaxed)
        const propertyKeywords = [
          'rent', 'rental', 'property', 'housing', 'real estate', 'landlord', 'tenant',
          'home', 'house', 'apartment', 'mortgage', 'market', 'price', 'investment',
          'buyer', 'seller', 'ownership', 'lease', 'accommodation'
        ]
        const hasPropertyKeyword = propertyKeywords.some(keyword => contentToCheck.includes(keyword))
        
        // Location keywords (more inclusive - not strictly required)
        const locationKeywords = ['australia', 'australian', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'nsw', 'vic', 'qld', 'wa', 'sa']
        const hasLocationKeyword = locationKeywords.some(keyword => contentToCheck.includes(keyword))
        
        // Exclude clearly irrelevant topics
        const excludeKeywords = ['crypto', 'bitcoin', 'cryptocurrency', 'mining', 'data breach', 'cyber', 'virus', 'covid', 'war', 'politics']
        const hasExcludedContent = excludeKeywords.some(keyword => contentToCheck.includes(keyword))
        
        // Accept if: (has property keyword AND location) OR (has property keyword and title strongly suggests property)
        const strongPropertyTitle = contentToCheck.includes('property') || contentToCheck.includes('housing') || contentToCheck.includes('real estate')
        
        return hasPropertyKeyword && !hasExcludedContent && (hasLocationKeyword || strongPropertyTitle)
      })
      .slice(0, 10) // Limit to 10 articles

    console.log(`After filtering: ${filteredArticles.length} relevant articles found`)
    articles.value = filteredArticles
    
    // If no relevant articles found, try a fallback search
    if (filteredArticles.length === 0) {
      console.log('No articles found with primary search, trying fallback...')
      await fetchFallbackNews()
    }

  } catch (err) {
    console.error('Error fetching news:', err)
    error.value = err.message || 'Failed to load news. Please check your internet connection.'
    toast.error('Failed to load latest news')
  } finally {
    loading.value = false
  }
}

// Format date to readable format
const formatDate = (dateString) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'Date unavailable'
  }
  
  // Calculate relative time (e.g., "2 days ago", "5 hours ago")
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

// Handle image loading errors
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// Fetch news on component mount
onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.rental-news-page {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #ffffff;
  color: #000000;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.site-title {
  font-size: 2.5rem;
  margin: 0;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 20px;
}

/* Loading and Error States */
.loading-container {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 40px;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 20px;
}

.retry-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #2980b9;
}

.no-articles {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* News List */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.news-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background-color: #fafafa;
  transition: box-shadow 0.3s ease;
}

.news-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.news-image {
  margin-bottom: 15px;
}

.news-image img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 5px;
}

.news-title {
  font-size: 1.4rem;
  margin: 0 0 10px 0;
}

.news-title a {
  color: #2c3e50;
  text-decoration: none;
}

.news-title a:hover {
  color: #3498db;
  text-decoration: underline;
}

.news-description {
  margin: 0 0 15px 0;
  line-height: 1.6;
  color: #444;
}

.news-meta {
  font-size: 0.9rem;
  color: #777;
}

.news-separator {
  margin: 0 8px;
}

.news-date {
  font-weight: 500;
}

.news-source {
  font-style: italic;
}

.news-author {
  color: #555;
}

/* Responsive Design */
@media (max-width: 768px) {
  .rental-news-page {
    padding: 10px;
  }
  
  .site-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .news-item {
    padding: 15px;
  }
  
  .news-title {
    font-size: 1.2rem;
  }
}
</style>