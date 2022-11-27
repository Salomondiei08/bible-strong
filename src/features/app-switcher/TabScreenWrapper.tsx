import React, { forwardRef } from 'react'
import { ImageStyle, TextStyle, View, ViewStyle } from 'react-native'
import { AnimatedStyleProp } from 'react-native-reanimated'
import { AnimatedBox } from './TabPreview'

interface TabScreenWrapperProps {
  children: React.ReactNode
  style: AnimatedStyleProp<ViewStyle | ImageStyle | TextStyle>
}

const TabScreenWrapper = forwardRef<View, TabScreenWrapperProps>(
  ({ style, children }, ref) => {
    return (
      <AnimatedBox style={style} bg="reverse" bottomTabBarPadding ref={ref}>
        {children}
      </AnimatedBox>
    )
  }
)

export default TabScreenWrapper
