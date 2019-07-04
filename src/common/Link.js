import React, { Component } from 'react'
import { pure, compose } from 'recompose'
import { TouchableOpacity, Linking } from 'react-native'
import { withNavigation } from 'react-navigation'

class Link extends Component {
  props: {
    navigation: Object,
    params?: Object,
    route: string,
  }

  handlePress = () => {
    const { navigation, route, href, params } = this.props
    if (route) {
      navigation.navigate(route, params)
    }
    if (href) {
      Linking.openURL(href)
    }
  }

  render () {
    return <TouchableOpacity {...this.props} onPress={this.handlePress} />
  }
}

export default compose(
  withNavigation,
  pure
)(Link)
