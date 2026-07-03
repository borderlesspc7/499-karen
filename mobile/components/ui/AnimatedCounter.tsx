import { useEffect, useRef, useState } from 'react'
import { Text } from 'react-native'

type AnimatedCounterProps = {
  value: number
  duration?: number
  formatter?: (value: number) => string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1200,
  formatter = (v) => Math.round(v).toLocaleString('pt-BR'),
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const fromRef = useRef(0)

  useEffect(() => {
    fromRef.current = display
    startRef.current = Date.now()

    function tick() {
      const elapsed = Date.now() - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = fromRef.current + (value - fromRef.current) * eased
      setDisplay(next)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration])

  return <Text className={className}>{formatter(display)}</Text>
}
