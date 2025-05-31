<template>
  <div class="rental-news-page">
    <header class="header">
      <h1 class="site-title">Rental Hotspot</h1>
    </header>

    <main class="main-content">
      <h2 class="section-title">Latest Rental Market News in Australia</h2>
      <div class="news-list">
        <div v-for="(article, index) in articles" :key="index" class="news-item">
          <div class="news-content">
            <h3 class="news-title">{{ article.title }}</h3>
            <p class="news-summary">{{ article.summary }}</p>
            <p class="news-meta">
              <span class="news-date">{{ article.date }}</span> |
              <span class="news-source">{{ article.source }}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const articles = [
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
    title: '“Only 2% of Rentals Are Affordable”: The Toughest Rental Market in Years',
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

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item {
  border-bottom: 1px solid #cccccc;
  padding-bottom: 10px;
}

.news-title {
  font-size: 1.5rem;
  margin: 0 0 10px 0;
}

.news-summary {
  margin: 0 0 10px 0;
}

.news-meta {
  font-size: 0.9rem;
  color: #555555;
}
</style>
