import { useEffect } from 'react'
import useLocalStorage from './use-local-storage'

const key = 'collapsed-sidebar'
const initalValue = false

export default function useIsCollapsed() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [isCollapsed, setIsCollapsed] = useLocalStorage(key, initalValue)

  useEffect(() => {
    const handleResize = () => {
      // Update isCollapsed based on window.innerWidth
      setIsCollapsed(window.innerWidth < 768 ? false : isCollapsed)
    }

    // Initial setup
    handleResize()

    // Add event listener for window resize
    window.addEventListener('resize', handleResize)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isCollapsed, setIsCollapsed])

  return [isCollapsed, setIsCollapsed] as const
}
