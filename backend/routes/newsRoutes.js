// TODO: NewsAPI proxy routes to bypass CORS in Codespaces/production
const express = require('express')
const router = express.Router()

// FIXME: NewsAPI proxy endpoint - needed because direct frontend calls fail in Codespaces
router.get('/property-news', async (req, res) => {
  try {
    const API_KEY = process.env.NEWS_API_KEY || 'd9b129de2e5e432e8315073b3e294fc3'
    
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'NewsAPI key not configured',
        fallback: true 
      })
    }

    // FIXME: Build NewsAPI query for Australian property news
    const params = new URLSearchParams({
      q: 'real estate OR property OR housing OR rental market Australia',
      domains: 'realestate.com.au,domain.com.au,news.com.au,abc.net.au,smh.com.au,theaustralian.com.au',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '15',
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    })

    console.log('Backend: Fetching from NewsAPI...')
    
    // TODO: Server-side fetch bypasses CORS restrictions
    const response = await fetch(`https://newsapi.org/v2/everything?${params}`, {
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`NewsAPI HTTP error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(`NewsAPI error: ${data.message}`)
    }
    
    // TODO: Process and filter articles for frontend
    if (data.articles && Array.isArray(data.articles)) {
      console.log(`Backend: Received ${data.articles.length} articles from NewsAPI`)
      
      const filteredArticles = data.articles
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
          // TODO: Complex nested data extraction with null safety
          return {
            title: article.title || 'No Title Available',
            description: article.description || 'No description available',
            publishedAt: article.publishedAt,
            
            // FIXME: Handle nested source object with optional fields
            source: {
              id: article.source?.id || null,
              name: article.source?.name || 'Unknown Source'
            },
            
            author: article.author || null,
            urlToImage: article.urlToImage || `https://picsum.photos/400/200?random=${Date.now() + index}`,
            url: article.url,
            content: article.content || null
          }
        })

      res.json({
        success: true,
        articles: filteredArticles,
        totalResults: data.totalResults,
        source: 'NewsAPI'
      })
    } else {
      console.warn('Backend: NewsAPI returned no articles')
      res.json({
        success: false,
        articles: [],
        fallback: true,
        message: 'No articles available from NewsAPI'
      })
    }

  } catch (err) {
    console.error('Backend NewsAPI fetch failed:', err.message)
    
    // TODO: Detailed error logging for debugging
    if (err.message.includes('401')) {
      console.error('NewsAPI authentication failed - check API key')
    } else if (err.message.includes('429')) {
      console.error('NewsAPI rate limit exceeded')
    }
    
    res.json({
      success: false,
      articles: [],
      fallback: true,
      error: err.message
    })
  }
})

module.exports = router