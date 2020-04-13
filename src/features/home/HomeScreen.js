import React from 'react'
import { ScrollView as RNScrollView, Linking, Platform } from 'react-native'
import * as Icon from '@expo/vector-icons'
import styled from '@emotion/native'

import RoundedCorner from '~common/ui/RoundedCorner'
import Box from '~common/ui/Box'
import { HomeScrollView } from '~common/ui/ScrollView'
import VerseOfTheDay from './VerseOfTheDay'
import StrongOfTheDay from './StrongOfTheDay'
import WordOfTheDay from './WordOfTheDay'
import NaveOfTheDay from './NaveOfTheDay'
import UserWidget from './UserWidget'
import Button from '~common/ui/Button'
import PlanHome from './PlanHome'

const FeatherIcon = styled(Icon.Feather)(({ theme }) => ({}))

const HomeScreen = () => {
  return (
    <Box grey>
      <HomeScrollView showsVerticalScrollIndicator={false}>
        <UserWidget />
        <Box grey>
          <RoundedCorner />
        </Box>
        <Box grey paddingTop={10}>
          <RNScrollView
            horizontal
            style={{ overflow: 'visible' }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              paddingHorizontal: 20,
              paddingVertical: 10,
              overflow: 'visible',
            }}
          >
            <NaveOfTheDay />
            <StrongOfTheDay type="grec" />
            <StrongOfTheDay
              type="hebreu"
              color1="rgba(248,131,121,1)"
              color2="rgba(255,77,93,1)"
            />
            <WordOfTheDay color1="#ffd255" color2="#ffbc00" />
          </RNScrollView>
        </Box>
        <PlanHome />
        <VerseOfTheDay />
        <Box grey>
          <Box
            background
            row
            padding={20}
            style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30 }}
          >
            <Box flex>
              <Button
                color="#3b5998"
                onPress={() =>
                  Linking.openURL('https://www.facebook.com/fr.bible.strong')
                }
                leftIcon={
                  <FeatherIcon
                    name="facebook"
                    size={20}
                    color="white"
                    style={{ marginRight: 10 }}
                  />
                }
              >
                Suivre
              </Button>
            </Box>
            <Box width={20} />
            <Box flex>
              <Button
                color="#2ecc71"
                route="FAQ"
                leftIcon={
                  <FeatherIcon
                    name="help-circle"
                    size={20}
                    color="white"
                    style={{ marginRight: 10 }}
                  />
                }
              >
                FAQ
              </Button>
              {/* <Button
                color="#7ed6df"
                title="Soutenir"
                {...(Platform.OS === 'android'
                  ? {
                      route: 'Support',
                    }
                  : {
                      onPress: () =>
                        Linking.openURL('https://www.paypal.me/smontlouis'),
                    })}
                leftIcon={
                  <FeatherIcon
                    name="thumbs-up"
                    size={20}
                    color="white"
                    style={{ marginRight: 10 }}
                  />
                }
              /> */}
            </Box>
          </Box>
          {/* <Box background padding={20} paddingTop={0}>
            <Button
              color="#2ecc71"
              route="FAQ"
              title="Foire aux questions"
              leftIcon={
                <FeatherIcon
                  name="help-circle"
                  size={20}
                  color="white"
                  style={{ marginRight: 10 }}
                />
              }
            />
          </Box> */}
          {__DEV__ && (
            <Box background padding={20} paddingTop={0}>
              <Button route="Storybook">Storybook</Button>
            </Box>
          )}
        </Box>
      </HomeScrollView>
    </Box>
  )
}
export default HomeScreen
