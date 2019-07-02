import React from 'react'
import { TouchableOpacity } from 'react-native'
import distanceInWords from 'date-fns/distance_in_words'
import frLocale from 'date-fns/locale/fr'
import styled from '@emotion/native'
import { withNavigation } from 'react-navigation'

import Loading from '~common/Loading'
import Box from '~common/ui/Box'
import Text from '~common/ui/Text'
import truncate from '~helpers/truncate'
import formatVerseContent from '~helpers/formatVerseContent'
import books from '~assets/bible_versions/books-desc'
import useBibleVerses from '~helpers/useBibleVerses'

const DateText = styled.Text(({ theme }) => ({
  color: theme.colors.tertiary
}))

const Circle = styled(Box)(({ theme }) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.colors.secondary,
  marginRight: 5,
  marginTop: 5
}))

const Container = styled(Box)(({ theme }) => ({
  padding: 20,
  marginBottom: 10,
  borderBottomColor: theme.colors.border,
  borderBottomWidth: 1
}))

const VerseComponent = ({ color, date, verseIds, navigation }) => {
  const verses = useBibleVerses(verseIds)

  if (!verses.length) {
    return <Loading />
  }

  const { title, content } = formatVerseContent(verses)
  const formattedDate = distanceInWords(Number(date), Date.now(), { locale: frLocale })
  const { Livre, Chapitre, Verset } = verses[0]
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('BibleView', {
      isReadOnly: true,
      book: books[Livre - 1],
      chapter: Chapitre,
      verse: Verset
    })}>
      <Container>
        <Box row style={{ marginBottom: 10 }}>
          <Box flex row>
            <Circle color={color} />
            <Text style={{ fontSize: 12, lineHeight: 20 }}>{title}</Text>
          </Box>
          <DateText style={{ fontSize: 10 }}>Il y a {formattedDate}</DateText>
        </Box>
        <Text medium>{truncate(content, 200)}</Text>
      </Container>
    </TouchableOpacity>
  )
}

export default withNavigation(VerseComponent)