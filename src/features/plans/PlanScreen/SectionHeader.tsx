import { useTheme } from '@emotion/react'
import Lottie from 'lottie-react-native'
import React from 'react'
import ProgressCircle from 'react-native-progress/Circle'

import styled from '@emotion/native'
import { Image } from 'expo-image'
import Link from '~common/Link'
import { ComputedSection } from '~common/types'
import Border from '~common/ui/Border'
import Box, { AnimatableBox } from '~common/ui/Box'
import { FeatherIcon } from '~common/ui/Icon'
import Text from '~common/ui/Text'
import { Theme } from '~themes'
import { useFireStorage } from '../plan.hooks'

const CircleImage = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 2,
  right: 0,
  left: 2,
  bottom: 0,
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: theme.colors.lightGrey,
}))

const Section = ({
  id,
  title,
  subTitle,
  progress,
  toggle,
  isCollapsed,
  image,
}: Omit<ComputedSection, 'data'> & {
  toggle: (id: string) => void
  isCollapsed: boolean
}) => {
  const theme: Theme = useTheme()
  const cacheImage = useFireStorage(image)
  const isSectionCompleted = progress === 1
  return (
    <Link onPress={() => toggle(id)}>
      <Box row paddingLeft={20} paddingVertical={20} backgroundColor="reverse">
        {isSectionCompleted ? (
          <Lottie
            autoPlay
            style={{
              width: 40,
              height: 40,
            }}
            source={require('../../../assets/images/medal.json')}
          />
        ) : (
          <ProgressCircle
            size={38}
            progress={progress}
            borderWidth={0}
            color={theme.colors.primary}
            unfilledColor={progress ? 'rgb(230,230,230)' : undefined}
            fill="none"
          >
            <CircleImage center>
              {cacheImage && (
                <Image
                  style={{ width: 26, height: 26 }}
                  source={{
                    uri: cacheImage,
                  }}
                />
              )}
              {title && !cacheImage && (
                <Box>
                  <Text title fontSize={14} color="primary">
                    {title.substr(0, 1)}
                  </Text>
                </Box>
              )}
            </CircleImage>
          </ProgressCircle>
        )}

        <Box flex paddingLeft={20} justifyContent="center">
          <Text>{title}</Text>
          {subTitle && <Text opacity={0.6}>{subTitle}</Text>}
        </Box>
        <Box width={40} center>
          {/* @ts-expect-error */}
          <AnimatableBox
            width={17}
            height={17}
            center
            animation={{
              from: {
                rotate: !isCollapsed ? '180deg' : '0deg',
              },
              to: {
                rotate: isCollapsed ? '180deg' : '0deg',
              },
            }}
            duration={500}
          >
            <FeatherIcon color="grey" name="chevron-down" size={17} />
          </AnimatableBox>
        </Box>
      </Box>
      <Border />
    </Link>
  )
}

export default Section
