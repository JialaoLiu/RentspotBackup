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

// Mock news articles for demo purposes (NewsAPI free tier discontinued)
const mockArticles = [
  {
    title: 'Australian Renters Face Pressure: Over 40% Forced to Offer More to Secure Homes',
    description: 'Recent data shows that over half of Australian renters feel pressured in competitive markets and are forced to offer above asking prices to secure a rental property. The rental crisis continues to impact millions of Australians seeking affordable housing.',
    publishedAt: '2024-12-15T08:30:00Z',
    source: { name: 'Australian Property News' },
    author: 'Sarah Mitchell',
    url: '#',
    urlToImage: 'https://picsum.photos/400/200?random=1'
  },
  {
    title: 'Rental Crisis Deepens: $130K Annual Salary Now Needed to Afford Rent',
    description: 'According to a new report, the average Australian renter now needs to earn at least $130,000 per year to afford rent for a one-bedroom apartment nationwide. Housing affordability has reached crisis levels across major cities.',
    publishedAt: '2024-12-10T14:20:00Z',
    source: { name: 'Housing Market Weekly' },
    author: 'David Chen',
    url: '#',
    urlToImage: 'https://picsum.photos/400/200?random=2'
  },
  {
    title: '"Only 2% of Rentals Are Affordable": The Toughest Rental Market in Years',
    description: 'PropTrack\'s 2024 Rental Affordability Report finds that families earning the national median income of $116,000 can only afford 26% of available listings. The rental market has become increasingly challenging for average-income earners.',
    publishedAt: '2024-12-08T11:45:00Z',
    source: { name: 'Real Estate Today' },
    author: 'Emma Thompson',
    url: '#',
    urlToImage: 'https://picsum.photos/400/200?random=3'
  },
  {
    title: 'Sydney Property Prices Continue Upward Trend Despite Interest Rate Concerns',
    description: 'Despite ongoing concerns about interest rates, Sydney property prices have continued their upward trajectory. Market analysts suggest strong demand and limited supply are driving the trend.',
    publishedAt: '2024-12-05T16:10:00Z',
    source: { name: 'Sydney Property Report' },
    author: 'Michael Roberts',
    url: '#',
    urlToImage: 'https://picsum.photos/400/200?random=4'
  },
  {
    title: 'Government Announces New Housing Initiatives to Address Rental Crisis',
    description: 'The federal government has announced a comprehensive package of housing initiatives aimed at addressing the ongoing rental crisis. The measures include increased funding for social housing and tax incentives for property investors.',
    publishedAt: '2024-12-03T09:15:00Z',
    source: { name: 'Government Housing News' },
    author: 'Lisa Wang',
    url: '#',
    urlToImage: 'https://picsum.photos/400/200?random=5'
  },
  {
    title: 'Melbourne Apartment Market Shows Signs of Recovery',
    description: 'After months of decline, Melbourne\'s apartment market is showing early signs of recovery. New developments and improved buyer confidence are contributing to the positive trend.',
    publishedAt: '2024-12-01T13:30:00Z',
    source: { name: 'Melbourne Property Guide' },
    author: 'James Wilson',
    url: '#',
    urlToImage: 'https://picsum.photos/400/200?random=6'
  },
  {
    title: 'First Home Buyer Activity Increases Despite Market Challenges',
    description: 'First home buyer activity has increased significantly over the past quarter, despite ongoing market challenges. Government incentives and improved lending conditions are supporting new entrants to the market.',
    publishedAt: '2024-11-28T10:45:00Z',
    source: { name: 'First Home Buyer News' },
    author: 'Rachel Green',
    url: '#',
    urlToImage: 'https://picsum.photos/400/200?random=7'
  },
  {
    title: 'Regional Property Markets Outperform Capital Cities',
    description: 'Regional property markets across Australia are outperforming their capital city counterparts, with stronger price growth and increased buyer interest driving activity in smaller centers.',
    publishedAt: '2024-11-25T15:20:00Z',
    source: { name: 'Regional Property Times' },
    author: 'Tom Anderson',
    url: '#',
    urlToImage: 'https://picsum.photos/400/200?random=8'
  }
]

// Original mock data implementation - keeping for fallback
// const fetchNews = async () => {
//   loading.value = true
//   error.value = null
//   try {
//     await new Promise(resolve => setTimeout(resolve, 1000))
//     console.log('Loading mock property news articles...')
//     articles.value = mockArticles
//     if (articles.value.length === 0) {
//       error.value = 'No property news articles found at the moment.'
//     }
//   } catch (err) {
//     console.error('Error loading news:', err)
//     error.value = 'Failed to load news. Please try again later.'
//     toast.error('Failed to load latest news')
//   } finally {
//     loading.value = false
//   }
// }

// TODO: Upgraded to NewsAPI integration with fallback to mock data
const fetchNews = async () => {
  loading.value = true
  error.value = null

  try {
    // FIXME: Try real NewsAPI first, then fallback to mock
    const realNews = await fetchFromNewsAPI()
    
    if (realNews && realNews.length > 0) {
      console.log('Successfully loaded real news from NewsAPI')
      articles.value = realNews
    } else {
      // Keep original mock data logic as fallback
      console.log('NewsAPI unavailable, using mock data as fallback')
      await new Promise(resolve => setTimeout(resolve, 800))
      articles.value = mockArticles
    }
    
    if (articles.value.length === 0) {
      error.value = 'No property news articles found at the moment.'
    }

  } catch (err) {
    console.error('Error loading news:', err)
    
    // Final fallback to original mock implementation
    try {
      console.log('Using mock data due to API error')
      articles.value = mockArticles
    } catch (fallbackErr) {
      error.value = 'Failed to load news. Please try again later.'
      toast.error('Failed to load latest news')
    }
  } finally {
    loading.value = false
  }
}

// TODO: Added NewsAPI integration for real property news
const fetchFromNewsAPI = async () => {
  const API_KEY = process.env.VUE_APP_NEWS_API_KEY || 'd9b129de2e5e432e8315073b3e294fc3'
  
  if (!API_KEY) {
    console.warn('NewsAPI key not configured')
    return null
  }

  try {
    // FIXME: Targeting Australian property news specifically
    const params = new URLSearchParams({
      q: 'real estate OR property OR housing OR rental market Australia',
      domains: 'realestate.com.au,domain.com.au,news.com.au,abc.net.au,smh.com.au,theaustralian.com.au',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '15',
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
    })

    console.log('Fetching from NewsAPI...')
    
    // TODO: Direct NewsAPI call - may need backend proxy for production due to CORS
    const response = await fetch(`https://newsapi.org/v2/everything?${params}`, {
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json'
      },
      // FIXME: Add mode for CORS handling in Codespaces
      mode: 'cors'
    })

    if (!response.ok) {
      throw new Error(`NewsAPI HTTP error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Handle NewsAPI error responses
    if (data.status === 'error') {
      throw new Error(`NewsAPI error: ${data.message}`)
    }
    
    // TODO: Process complex nested API response with variability handling
    if (data.articles && Array.isArray(data.articles)) {
      console.log(`Received ${data.articles.length} articles from NewsAPI`)
      
      return data.articles
        .filter(article => {
          // FIXME: Filter out removed/null content due to API variability
          return article && 
                 article.title && 
                 article.title !== '[Removed]' &&
                 article.description && 
                 article.description !== '[Removed]' &&
                 article.url &&
                 article.publishedAt
        })
        .slice(0, 12)
        .map((article, index) => {
          // TODO: Complex nested data extraction with null safety for API compliance
          return {
            title: article.title || 'No Title Available',
            description: article.description || 'No description available',
            publishedAt: article.publishedAt,
            
            // FIXME: Handle nested source object with optional fields (API variability)
            source: {
              id: article.source?.id || null,
              name: article.source?.name || 'Unknown Source'
            },
            
            // Handle optional author field (common API variability)
            author: article.author || null,
            
            // TODO: Handle optional image with fallback for missing images
            urlToImage: article.urlToImage || `https://picsum.photos/400/200?random=${Date.now() + index}`,
            
            // Original URL for external linking
            url: article.url,
            
            // FIXME: Handle optional content field (often truncated by NewsAPI)
            content: article.content || null
          }
        })
    }

    console.warn('NewsAPI returned no articles')
    return null

  } catch (err) {
    console.error('NewsAPI fetch failed:', err.message)
    
    // TODO: Log specific error types for debugging
    if (err.message.includes('401')) {
      console.error('NewsAPI authentication failed - check API key')
    } else if (err.message.includes('429')) {
      console.error('NewsAPI rate limit exceeded')
    } else if (err.message.includes('CORS')) {
      console.error('CORS error - may need proxy server for production')
    }
    
    return null
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

// Load mock news on component mount
onMounted(() => {
  console.log('News component mounted - using mock data for demo')
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