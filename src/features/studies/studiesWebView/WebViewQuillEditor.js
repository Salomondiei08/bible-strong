import React, { createRef } from 'react'
import { withNavigation } from 'react-navigation'
import {
  View,
  ActivityIndicator,
  Alert,
  WebView
} from 'react-native'

// import { WebView } from 'react-native-webview'

import reactQuillEditorHTML from './build/reactQuillEditor-index.html'

class WebViewQuillEditor extends React.Component {
  webViewRef = createRef();

  componentDidMount () {
    this.props.shareMethods(this.dispatchToWebView)
  }

  componentDidUpdate (prevProps, prevState) {
    const oldParams = prevProps.params || {}
    const newParams = this.props.params || {}

    if (JSON.stringify(oldParams) !== JSON.stringify(newParams)) {
      if (newParams.type.includes('verse')) {
        const isBlock = newParams.type.includes('block')
        this.dispatchToWebView(isBlock ? 'GET_BIBLE_VERSES_BLOCK' : 'GET_BIBLE_VERSES', newParams)
      } else {
        const isBlock = newParams.type.includes('block')
        this.dispatchToWebView(isBlock ? 'GET_BIBLE_STRONG_BLOCK' : 'GET_BIBLE_STRONG', newParams)
      }
    }
  }

  dispatchToWebView = (type, payload) => {
    const webView = this.webViewRef.current

    if (webView) {
      console.log('RN DISPATCH: ', type)
      webView.postMessage(
        JSON.stringify({
          type,
          payload
        }),
        '*'
      )
    }
  };

  handleMessage = (event) => {
    const { navigation } = this.props
    let msgData
    try {
      msgData = JSON.parse(event.nativeEvent.data)
      // console.log('RN RECEIVE: ', msgData.type)

      switch (msgData.type) {
        case 'EDITOR_LOADED':
          this.editorLoaded()
          break
        case 'TEXT_CHANGED':
          if (this.props.onDeltaChangeCallback) {
            delete msgData.payload.type
            const {
              delta,
              deltaChange,
              deltaOld,
              changeSource
            } = msgData.payload
            this.props.onDeltaChangeCallback(
              delta,
              deltaChange,
              deltaOld,
              changeSource
            )
          }
          break
        case 'SELECT_BIBLE_VERSE': {
          navigation.navigate('BibleView', {
            isSelectionMode: 'verse'
          })
          return
        }
        case 'SELECT_BIBLE_STRONG': {
          navigation.navigate('BibleView', {
            isSelectionMode: 'strong'
          })
          return
        }
        case 'SELECT_BIBLE_VERSE_BLOCK': {
          navigation.navigate('BibleView', {
            isSelectionMode: 'verse-block'
          })
          return
        }
        case 'SELECT_BIBLE_STRONG_BLOCK': {
          navigation.navigate('BibleView', {
            isSelectionMode: 'strong-block'
          })
          return
        }
        case 'ACTIVE_FORMATS': {
          console.log(msgData.payload)
          this.props.setActiveFormats(msgData.payload)
          return
        }
        case 'CONSOLE_LOG': {
          console.log(`%c${msgData.payload}`, 'color:black;background-color:#81ecec')
          return
        }
        default:
          console.warn(
            `WebViewQuillEditor Error: Unhandled message type received "${
              msgData.type
            }"`
          )
      }
    } catch (err) {
      console.warn(err)
    }
  };

  onWebViewLoaded = () => {
    this.dispatchToWebView('LOAD_EDITOR')
  };

  editorLoaded = () => {
    if (this.props.contentToDisplay) {
      console.log('Content to Display: ', this.props.contentToDisplay)
      this.dispatchToWebView('SET_CONTENTS', {
        delta: this.props.contentToDisplay
      })
    }
  };

  showLoadingIndicator = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color='green' />
      </View>
    )
  };

  onError = (error) => {
    Alert.alert('WebView onError', error, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ])
  };

  renderError = (error) => {
    Alert.alert('WebView renderError', error, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ])
  };

  render = () => {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          useWebKit
          originWhitelist={['*']}
          ref={this.webViewRef}
          source={reactQuillEditorHTML}
          onLoadEnd={this.onWebViewLoaded}
          onMessage={this.handleMessage}
          renderLoading={this.showLoadingIndicator}
          renderError={this.renderError}
          onError={this.onError}
          allowFileAccess
        />
      </View>
    )
  };
}

// Specifies the default values for props:
WebViewQuillEditor.defaultProps = {
  theme: 'snow'
}

export default withNavigation(WebViewQuillEditor)
