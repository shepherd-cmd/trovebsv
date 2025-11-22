/**
 * Haptic feedback utilities for mobile devices
 */

export const haptics = {
  // Light tap feedback (e.g., button press)
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  // Medium feedback (e.g., photo capture)
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  // Success pattern (e.g., inscription complete)
  success: () => {
    if ('vibrate' in navigator) {
      // Pattern: short, pause, short, pause, longer
      navigator.vibrate([20, 50, 20, 50, 100]);
    }
  },

  // Error pattern
  error: () => {
    if ('vibrate' in navigator) {
      // Pattern: two quick vibrations
      navigator.vibrate([30, 100, 30]);
    }
  },
};
