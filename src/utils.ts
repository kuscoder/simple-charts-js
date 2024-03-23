/**
 * Returns a debounced function that delays invoking the provided function until after `timeout` milliseconds have elapsed since the last time it was invoked. The debounced function will always use the last arguments provided to it.
 *
 * @param {function} func - The function to debounce.
 * @param {number} timeout - The number of milliseconds to delay.
 * @return {function} - The debounced function.
 */
export function debounce<Args extends unknown[]>(
   func: (...args: Args) => void,
   timeout: number
): (...args: Args) => void {
   let timer: NodeJS.Timeout
   return (...args: Args) => {
      clearTimeout(timer)
      timer = setTimeout(() => func(...args), timeout)
   }
}

/**
 * Returns a throttled version of the given function that will only be executed once within the specified timeout.
 *
 * @param {function} func - The function to be throttled.
 * @param {number} timeout - The timeout in milliseconds.
 * @return {function} - The throttled function.
 */
export function throttle<Args extends unknown[]>(
   func: (...args: Args) => void,
   timeout: number
): (...args: Args) => void {
   let timer: NodeJS.Timeout | null
   return (...args: Args) => {
      if (!timer) {
         timer = setTimeout(() => {
            func(...args)
            timer = null
         }, timeout)
      }
   }
}

/**
 * Applies the specified styles to the given HTML element.
 *
 * @param {HTMLElement} element - The HTML element to apply styles to
 * @param {Record<string, string>} styles - The styles to apply to the element
 */
export function styles(element: HTMLElement, styles: Record<string, string>) {
   for (const [key, value] of Object.entries(styles)) {
      element.style.setProperty(key, value)
   }
}
