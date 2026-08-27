import { onMounted, onUnmounted, ref } from 'vue'

const MOBILE_QUERY = '(max-width: 480px)'

export function useIsMobile() {
  const isMobile = ref(false)
  let mediaQuery: MediaQueryList | null = null

  function sync() {
    isMobile.value = mediaQuery?.matches ?? false
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(MOBILE_QUERY)
    sync()
    mediaQuery.addEventListener('change', sync)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', sync)
  })

  return { isMobile }
}
