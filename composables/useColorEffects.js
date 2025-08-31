/**
 * Composable for managing eyeshadow color effects
 * Centralizes effect logic and provides consistent API across components
 * 
 * @returns {Object} Effects utilities and constants
 */
export function useColorEffects() {
  /**
   * Available eyeshadow effects registry
   * @readonly
   */
  const EFFECTS = {
    MATTE: 'matte',
    SHIMMER: 'shimmer', 
    SPARKLY: 'sparkly'
  } 

  /**
   * Get CSS class name for a specific effect
   * @param {string} effect - Effect name (defaults to matte)
   * @returns {string} CSS class name like 'effect-matte'
   */
  const getEffectClass = (effect = EFFECTS.MATTE) => {
    // Validate and fallback to matte if invalid
    const validEffect = isValidEffect(effect) ? effect : EFFECTS.MATTE
    return `effect-${validEffect}`
  }

  /**
   * Get effect classes object for Vue class binding
   * @param {string} effect - Effect name (defaults to matte)  
   * @returns {Object} Vue class binding object
   * @example
   * // Usage in template:
   * <div :class="getEffectClasses(colorData.effect)">
   */
  const getEffectClasses = (effect = EFFECTS.MATTE) => {
    const validEffect = isValidEffect(effect) ? effect : EFFECTS.MATTE
    return {
      [`effect-${validEffect}`]: true
    }
  }

  /**
   * Check if effect name is valid
   * @param {string} effect - Effect name to validate
   * @returns {boolean} True if effect is valid
   */
  const isValidEffect = (effect) => {
    return effect && Object.values(EFFECTS).includes(effect)
  }

  /**
   * Get all available effect names as array
   * @returns {string[]} Array of effect names
   */
  const getAllEffects = () => {
    return Object.values(EFFECTS)
  }

  /**
   * Get effect display name (capitalized)
   * @param {string} effect - Effect name
   * @returns {string} Capitalized effect name
   */
  const getEffectDisplayName = (effect) => {
    const validEffect = isValidEffect(effect) ? effect : EFFECTS.MATTE
    return validEffect.charAt(0).toUpperCase() + validEffect.slice(1)
  }

  return {
    EFFECTS,
    getEffectClass,
    getEffectClasses,
    isValidEffect,
    getAllEffects,
    getEffectDisplayName
  }
}