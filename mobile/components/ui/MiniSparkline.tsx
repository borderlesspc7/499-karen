import { useState } from 'react'
import { View } from 'react-native'
import Svg, { Polyline } from 'react-native-svg'

type MiniSparklineProps = {
  data: number[]
  color: string
  height?: number
}

export function MiniSparkline({ data, color, height = 36 }: MiniSparklineProps) {
  const [width, setWidth] = useState(0)

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points =
    width > 0
      ? data
          .map((value, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * width
            const y = height - ((value - min) / range) * (height - 6) - 3
            return `${x},${y}`
          })
          .join(' ')
      : ''

  return (
    <View
      className="w-full overflow-hidden"
      style={{ height }}
      onLayout={(event) => {
        const nextWidth = Math.floor(event.nativeEvent.layout.width)
        if (nextWidth > 0 && nextWidth !== width) {
          setWidth(nextWidth)
        }
      }}
    >
      {width > 0 ? (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </View>
  )
}
