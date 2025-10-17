// src/utils/formatters.js

/**
 * Format a date (e.g., 2025-01-11) to "January 11, 2025"
 * @param {string|Date|null} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Compute age from a given date of birth
 * @param {string|Date|null} dob
 * @returns {number|string}
 */
export function calculateAge(dob) {
  if (!dob) return '—'
  const birthDate = new Date(dob)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  const dayDiff = today.getDate() - birthDate.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }

  return age
}
