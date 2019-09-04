import React from 'react'
import { Platform } from 'react-native'
import * as Icon from '@expo/vector-icons'
import { pure } from 'recompose'
import styled from '@emotion/native'

import Text from '~common/ui/Text'
import Box from '~common/ui/Box'
import Link from '~common/Link'
import Back from '~common/Back'

const LinkBox = styled(Link)({
  flexDirection: 'row',
  alignItems: 'center',
  paddingRight: 15,
  paddingVertical: 15
})

const StyledText = styled(Text)({
  fontSize: 16,
  fontWeight: 'bold',
  marginRight: 5
})

const BibleParameters = styled.TouchableOpacity(({ theme }) => ({
  fontSize: 16,
  fontWeight: 'bold',
  marginLeft: 'auto',
  color: theme.colors.darkGrey
}))

const HeaderBox = styled(Box)(({ noBorder, theme }) => ({
  marginTop: Platform.OS === 'ios' ? 0 : 25,
  height: 50,
  alignItems: 'center',
  borderBottomWidth: noBorder ? 0 : 1,
  borderBottomColor: theme.colors.border,
  paddingLeft: 15,
  paddingRight: 15
  // width: theme.measures.maxWidth,
  // marginLeft: 'auto',
  // marginRight: 'auto'
}))

const StyledIcon = styled(Icon.Feather)(({ theme }) => ({
  color: theme.colors.default
}))

const MaterialCommunityIcon = styled(Icon.MaterialIcons)(({ theme }) => ({
  color: theme.colors.default
}))

const Header = ({
  isReadOnly,
  isSelectionMode,
  noBorder,
  book,
  chapter,
  verse,
  version,
  onBibleParamsClick
}) => {
  if (isReadOnly) {
    return (
      <HeaderBox noBorder={noBorder} row>
        <Box flex justifyContent="center">
          <Back style={{ marginRight: 15 }}>
            <StyledIcon name="arrow-left" size={20} />
          </Back>
        </Box>
        <Box grow center>
          <StyledText>
            {book.Nom} {chapter}:{verse} - {version}
          </StyledText>
        </Box>
        <Box flex />
      </HeaderBox>
    )
  }
  return (
    <HeaderBox noBorder={noBorder} row>
      {isSelectionMode && (
        <Box justifyContent="center">
          <Back style={{ marginRight: 15 }}>
            <StyledIcon name="arrow-left" size={20} />
          </Back>
        </Box>
      )}
      <LinkBox route="BibleSelect">
        <StyledText>
          {book.Nom} {chapter}
        </StyledText>
        <StyledIcon name="chevron-down" size={15} />
      </LinkBox>
      <LinkBox route="VersionSelector" params={{ version }}>
        <StyledText>{version}</StyledText>
        <StyledIcon name="chevron-down" size={15} />
      </LinkBox>
      <LinkBox route="Pericope">
        <MaterialCommunityIcon name="subtitles" size={20} />
      </LinkBox>

      {!isSelectionMode && (
        <LinkBox onPress={onBibleParamsClick} style={{ marginLeft: 'auto', paddingRight: 0 }}>
          <StyledText>Aa</StyledText>
        </LinkBox>
      )}
    </HeaderBox>
  )
}

export default pure(Header)
