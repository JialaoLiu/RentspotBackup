<template>
  <button
    @click="toggleDarkMode"
    class="dark-mode-toggle"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    aria-label="Toggle dark mode"
  >
    <Icon :name="isDark ? 'sun' : 'moon'" size="md" />
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Icon from './Common/Icon.vue'

const isDark = ref(false)

// Check for saved theme preference or default to system preference
onMounted(() => {
  console.log('DarkModeToggle: Component mounted')

  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  console.log('Saved theme:', savedTheme)
  console.log('System prefers dark:', systemPrefersDark)

  if (savedTheme) {
    // User has explicitly chosen a theme
    isDark.value = savedTheme === 'dark'
    setTheme(savedTheme)
    console.log('Using saved theme:', savedTheme)
  } else {
    // No saved preference - let CSS handle system preference
    // Just sync the button state with system preference
    isDark.value = systemPrefersDark
    // Don't call setTheme() here - let CSS media query handle it
    console.log('Using system preference (CSS handles it):', systemPrefersDark ? 'dark' : 'light')
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    console.log('System theme changed:', e.matches ? 'dark' : 'light')
    // Only update if user hasn't set a manual preference
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
      // Don't call setTheme() - let CSS handle system changes
    }
  })
})

function toggleDarkMode() {
  console.log('Toggle clicked. Current isDark:', isDark.value)

  const newTheme = isDark.value ? 'light' : 'dark'
  isDark.value = !isDark.value

  console.log('New theme will be:', newTheme)
  console.log('New isDark value:', isDark.value)

  setTheme(newTheme)
  localStorage.setItem('theme', newTheme)

  console.log('Theme saved to localStorage:', newTheme)
}

function setTheme(theme) {
  console.log('Setting theme to:', theme)
  console.log('HTML element before:', document.documentElement.getAttribute('data-theme'))

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }

  console.log('HTML element after:', document.documentElement.getAttribute('data-theme'))
}
</script>

<style scoped>
.dark-mode-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: all var(--transition-fast);
  color: var(--color-dark);
  background-color: var(--color-bg-primary);
}

.dark-mode-toggle:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-dark);
  transform: scale(1.05);
}

.dark-mode-toggle:active {
  transform: scale(0.95);
}
</style>