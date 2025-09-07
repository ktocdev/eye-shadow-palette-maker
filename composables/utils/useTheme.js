import { ref, computed, watch } from 'vue'
import themesData from '../../data/themes.json'

/**
 * Composable for managing site themes
 * Handles theme selection, application, and persistence
 */

const THEME_STORAGE_KEY = 'eyeshadow-palette-theme'
const DEFAULT_THEME = 'purple'

// Global theme state
const currentTheme = ref(loadStoredTheme())

/**
 * Load theme from localStorage or use default
 */
function loadStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && themesData.themes[stored]) {
      return stored
    }
  } catch (error) {
    console.warn('Failed to load stored theme:', error)
  }
  return DEFAULT_THEME
}

/**
 * Save theme to localStorage
 */
function saveTheme(themeKey) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeKey)
  } catch (error) {
    console.warn('Failed to save theme:', error)
  }
}

export function useTheme() {
  const themes = computed(() => themesData.themes)
  const themeOptions = computed(() => 
    Object.entries(themesData.themes).map(([key, theme]) => ({
      value: key,
      label: theme.name
    }))
  )
  
  const activeTheme = computed(() => themes.value[currentTheme.value])
  
  /**
   * Set the current theme
   */
  const setTheme = (themeKey) => {
    
    if (!themes.value[themeKey]) {
      console.warn(`Theme '${themeKey}' not found`)
      return
    }
    
    currentTheme.value = themeKey
    saveTheme(themeKey)
    applyTheme(themes.value[themeKey])
  }
  
  /**
   * Apply theme CSS custom properties to document root
   */
  const applyTheme = (theme) => {
    const root = document.documentElement
    
    // Map theme colors to existing CSS variables
    const colorMappings = {
      primary: '--color-purple-dark',
      primaryLight: '--color-purple-light', 
      primaryMedium: '--color-purple-medium',
      primaryDark: '--color-purple-dark',
      background: '--color-background-primary',
      backgroundSecondary: '--color-background-secondary',
      backgroundMuted: '--color-background-muted',
      border: '--border-color-medium',
      borderLight: '--border-color-light',
      shadow: '--shadow-button'
    }
    
    // Apply color variable mappings
    Object.entries(colorMappings).forEach(([themeKey, cssVar]) => {
      if (theme.colors[themeKey]) {
        root.style.setProperty(cssVar, theme.colors[themeKey])
        
        // Also set some derived colors for borders etc
        if (themeKey === 'primary') {
          root.style.setProperty('--border-color-medium', theme.colors.border)
          root.style.setProperty('--color-focus', theme.colors.focus)
        }
      }
    })
    
    // Apply main background gradient
    if (theme.gradients.main) {
      root.style.setProperty('--gradient-main-background', theme.gradients.main)
    }
    
    // Set theme class for additional styling
    root.className = root.className.replace(/theme-\w+/g, '')
    root.classList.add(`theme-${currentTheme.value}`)
  }
  
  /**
   * Initialize theme on first use
   */
  const initializeTheme = () => {
    applyTheme(activeTheme.value)
  }
  
  // Watch for theme changes and apply them
  watch(currentTheme, (newTheme) => {
    if (themes.value[newTheme]) {
      applyTheme(themes.value[newTheme])
    }
  }, { immediate: true })
  
  return {
    currentTheme: computed(() => currentTheme.value),
    activeTheme,
    themes,
    themeOptions,
    setTheme,
    initializeTheme
  }
}