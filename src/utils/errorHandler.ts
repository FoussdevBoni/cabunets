// src/utils/errorHandler.ts
export function setupErrorHandler() {
  window.addEventListener('unhandledrejection', (e) => {
    e.preventDefault()
    console.error('Promise non gérée:', e.reason)
  })

  window.addEventListener('error', (e) => {
    e.preventDefault()
    console.error('Erreur JS:', e.error)
  })
}