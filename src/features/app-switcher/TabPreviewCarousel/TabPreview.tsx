import { PrimitiveAtom, useAtom } from 'jotai'
import React, { memo } from 'react'
import { Image } from 'react-native'

import CommentIcon from '~common/CommentIcon'
import DictionnaryIcon from '~common/DictionnaryIcon'
import LexiqueIcon from '~common/LexiqueIcon'
import NaveIcon from '~common/NaveIcon'
import Box, { AnimatedBox, BoxProps } from '~common/ui/Box'
import { FeatherIcon } from '~common/ui/Icon'
import { TabItem } from '../../../state/tabs'
import getIconByTabType from '../utils/getIconByTabType'
import useTabConstants from '../utils/useTabConstants'

interface TabPreviewProps {
  index: number
  tabAtom: PrimitiveAtom<TabItem>
}

const TabPreview = ({ index, tabAtom }: TabPreviewProps & BoxProps) => {
  const [tab] = useAtom(tabAtom)
  const { WIDTH, HEIGHT, GAP } = useTabConstants()

  return (
    <AnimatedBox
      bg="reverse"
      center
      overflow="visible"
      width={WIDTH}
      height={HEIGHT}
      marginRight={GAP}
    >
      {tab.base64Preview ? (
        <Image
          style={{ width: '100%', height: '100%', borderRadius: 25 }}
          source={{ uri: `data:image/png;base64,${tab.base64Preview}` }}
        />
      ) : (
        <Box opacity={0.3}>{getIconByTabType(tab.type, 30)}</Box>
      )}
    </AnimatedBox>
  )
}

export default memo(TabPreview)
