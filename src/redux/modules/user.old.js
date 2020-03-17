import produce from 'immer'
import deepmerge from 'deepmerge'
import * as Sentry from '@sentry/react-native'

import { clearSelectedVerses } from './bible'

import defaultColors from '~themes/colors'
import darkColors from '~themes/darkColors'

import { firebaseDb } from '~helpers/firebase'
import orderVerses from '~helpers/orderVerses'
import generateUUID from '~helpers/generateUUID'
import { versions, getIfVersionNeedsUpdate } from '~helpers/bibleVersions'
import { databases, getIfDatabaseNeedsUpdate } from '~helpers/databases'

export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS'
export const USER_UPDATE_PROFILE = 'USER_UPDATE_PROFILE'
export const USER_LOGOUT = 'USER_LOGOUT'

export const ADD_HIGHLIGHT = 'user/ADD_HIGHLIGHT'
export const REMOVE_HIGHLIGHT = 'user/REMOVE_HIGHLIGHT'

export const SET_SETTINGS_ALIGN_CONTENT = 'user/SET_SETTINGS_ALIGN_CONTENT'
export const INCREASE_SETTINGS_FONTSIZE_SCALE =
  'user/INCREASE_SETTINGS_FONTSIZE_SCALE'
export const DECREASE_SETTINGS_FONTSIZE_SCALE =
  'user/DECREASE_SETTINGS_FONTSIZE_SCALE'
export const SET_SETTINGS_TEXT_DISPLAY = 'user/SET_SETTINGS_TEXT_DISPLAY'
export const SET_SETTINGS_THEME = 'user/SET_SETTINGS_THEME'
export const SET_SETTINGS_PRESS = 'user/SET_SETTINGS_PRESS'
export const SET_SETTINGS_NOTES_DISPLAY = 'user/SET_SETTINGS_NOTES_DISPLAY'
export const SET_SETTINGS_COMMENTS_DISPLAY =
  'user/SET_SETTINGS_COMMENTS_DISPLAY'

export const ADD_NOTE = 'user/ADD_NOTE'
export const EDIT_NOTE = 'user/EDIT_NOTE'
export const REMOVE_NOTE = 'user/REMOVE_NOTE'

export const SAVE_ALL_LOGS_AS_SEEN = 'user/SAVE_ALL_LOGS_AS_SEEN'

export const ADD_TAG = 'user/ADD_TAG'
export const TOGGLE_TAG_ENTITY = 'TOGGLE_TAG_ENTITY'
export const UPDATE_TAG = 'user/UPDATE_TAG'
export const REMOVE_TAG = 'user/REMOVE_TAG'

export const CREATE_STUDY = 'user/CREATE_STUDY'
export const UPDATE_STUDY = 'user/UPDATE_STUDY'
export const UPLOAD_STUDY = 'user/UPLOAD_STUDY'
export const DELETE_STUDY = 'user/DELETE_STUDY'

export const CHANGE_COLOR = 'user/CHANGE_COLOR'

export const SET_HISTORY = 'user/SET_HISTORY'
export const DELETE_HISTORY = 'user/DELETE_HISTORY'
export const UPDATE_USER_DATA = 'user/UPDATE_USER_DATA'

export const SET_LAST_SEEN = 'user/SET_LAST_SEEN'

export const SET_NOTIFICATION_VOD = 'user/SET_NOTIFICATION_VOD'
export const SET_NOTIFICATION_ID = 'user/SET_NOTIFICATION_ID'

export const TOGGLE_COMPARE_VERSION = 'user/TOGGLE_COMPARE_VERSION'

export const GET_CHANGELOG = 'user/GET_CHANGELOG'
export const GET_CHANGELOG_SUCCESS = 'user/GET_CHANGELOG_SUCCESS'
export const GET_CHANGELOG_FAIL = 'user/GET_CHANGELOG_FAIL'

export const GET_VERSION_UPDATE = 'user/GET_VERSION_UPDATE'
export const GET_VERSION_UPDATE_SUCCESS = 'user/GET_VERSION_UPDATE_SUCCESS'
export const GET_VERSION_UPDATE_FAIL = 'user/GET_VERSION_UPDATE_FAIL'
export const SET_VERSION_UPDATED = 'user/SET_VERSION_UPDATED'

export const SET_FONT_FAMILY = 'user/SET_FONT_FAMILY'

export const APP_FETCH_DATA = 'user/APP_FETCH_DATA'
export const APP_FETCH_DATA_FAIL = 'user/APP_FETCH_DATA_FAIL'

const initialState = {
  id: '',
  email: '',
  displayName: '',
  photoURL: '',
  provider: '',
  lastSeen: 0,
  emailVerified: false,
  isLoading: false,
  notifications: {
    verseOfTheDay: '07:00',
    notificationId: ''
  },
  changelog: {
    isLoading: true,
    lastSeen: 0,
    data: []
  },
  needsUpdate: {},
  fontFamily: 'Literata Book',
  bible: {
    changelog: {},
    highlights: {},
    notes: {},
    studies: {},
    tags: {},
    history: [],
    settings: {
      alignContent: 'justify',
      fontSizeScale: 0,
      textDisplay: 'inline',
      theme: 'default',
      press: 'shortPress',
      notesDisplay: 'inline',
      commentsDisplay: false,
      colors: {
        default: defaultColors,
        dark: darkColors
      },
      compare: {
        LSG: true
      }
    }
  }
}

const addDateAndColorToVerses = (verses, highlightedVerses, color) => {
  const formattedObj = Object.keys(verses).reduce(
    (obj, verse) => ({
      ...obj,
      [verse]: {
        color,
        date: Date.now(),
        ...(highlightedVerses[verse] && {
          tags: highlightedVerses[verse].tags || {}
        })
      }
    }),
    {}
  )

  return formattedObj
}

const removeEntityInTags = (draft, entity, key) => {
  for (const tag in draft.bible.tags) {
    if (draft.bible.tags[tag][entity]) {
      delete draft.bible.tags[tag][entity][key]
    }
  }
}

const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

// UserReducer
export default produce((draft, action) => {
  switch (action.type) {
    case APP_FETCH_DATA: {
      draft.isLoading = true
      break
    }
    case APP_FETCH_DATA_FAIL: {
      draft.isLoading = false
      break
    }
    case SET_FONT_FAMILY: {
      draft.fontFamily = action.payload
      break
    }
    case SET_NOTIFICATION_VOD: {
      draft.notifications.verseOfTheDay = action.payload
      break
    }
    case SET_LAST_SEEN: {
      draft.lastSeen = Date.now()
      break
    }
    case USER_UPDATE_PROFILE:
    case USER_LOGIN_SUCCESS: {
      const {
        id,
        email,
        displayName,
        photoURL,
        provider,
        lastSeen,
        emailVerified,
        bible
      } = action.profile

      const isLogged = !!draft.id
      const { remoteLastSeen } = action
      const { lastSeen: localLastSeen } = draft

      draft.id = id
      draft.email = email
      draft.displayName = displayName
      draft.photoURL = photoURL
      draft.provider = provider
      draft.lastSeen = lastSeen
      draft.emailVerified = emailVerified
      draft.isLoading = false

      if (bible) {
        if (!isLogged) {
          console.log('User was not logged, merge data')
          draft.bible = deepmerge(draft.bible, bible, {
            arrayMerge: overwriteMerge
          })
        } else if (remoteLastSeen > localLastSeen) {
          // Remote wins
          console.log('Remote wins')
          draft.bible = { ...draft.bible, ...bible }
        } else if (remoteLastSeen < localLastSeen) {
          console.log('Local wins')
          // Local wins - do nothing
        } else {
          console.log('Last seen equals remote last seen, do nothing')
        }

        // Now take care of studies
        if (action.studies && Object.keys(action.studies).length) {
          if (draft.bible.studies) {
            Object.keys(action.studies).forEach(remoteStudyId => {
              if (draft.bible.studies[remoteStudyId]) {
                // We have a conflict here
                console.log(
                  `We have a conflict with ${remoteStudyId}, pick by modified_date`
                )
                const localModificationDate =
                  draft.bible.studies[remoteStudyId].modified_at
                const remoteModificationDate =
                  action.studies[remoteStudyId].modified_at
                if (remoteModificationDate > localModificationDate) {
                  console.log('Remote date is recent')
                  draft.bible.studies[remoteStudyId] =
                    action.studies[remoteStudyId]
                }
              } else {
                // No conflicts, just put that study in there
                console.log(
                  `No conflicts for ${remoteStudyId}, just put that story in there`
                )
                draft.bible.studies[remoteStudyId] =
                  action.studies[remoteStudyId]
              }
            })
          } else {
            draft.bible.studies = {}
            draft.bible.studies = bible.studies
          }
        }
      }
      break
    }
    case USER_LOGOUT: {
      return {
        ...initialState,
        bible: {
          ...initialState.bible,
          // Keep changelog
          changelog: draft.bible.changelog
        }
      }
    }
    case ADD_NOTE: {
      draft.bible.notes = {
        ...draft.bible.notes,
        ...action.payload
      }
      break
    }
    case REMOVE_NOTE: {
      delete draft.bible.notes[action.payload]
      removeEntityInTags(draft, 'notes', action.payload)
      break
    }
    case ADD_HIGHLIGHT: {
      draft.bible.highlights = {
        ...draft.bible.highlights,
        ...action.selectedVerses
      }
      break
    }
    case REMOVE_HIGHLIGHT: {
      Object.keys(action.selectedVerses).forEach(key => {
        delete draft.bible.highlights[key]
        removeEntityInTags(draft, 'highlights', key)
      })
      break
    }
    case SET_SETTINGS_ALIGN_CONTENT: {
      draft.bible.settings.alignContent = action.payload
      break
    }
    case SET_SETTINGS_TEXT_DISPLAY: {
      draft.bible.settings.textDisplay = action.payload
      break
    }
    case SET_SETTINGS_THEME: {
      draft.bible.settings.theme = action.payload
      break
    }
    case SET_SETTINGS_PRESS: {
      draft.bible.settings.press = action.payload
      break
    }
    case SET_SETTINGS_NOTES_DISPLAY: {
      draft.bible.settings.notesDisplay = action.payload
      break
    }
    case SET_SETTINGS_COMMENTS_DISPLAY: {
      draft.bible.settings.commentsDisplay = action.payload
      break
    }
    case INCREASE_SETTINGS_FONTSIZE_SCALE: {
      if (draft.bible.settings.fontSizeScale < 3) {
        draft.bible.settings.fontSizeScale += 1
      }
      break
    }
    case DECREASE_SETTINGS_FONTSIZE_SCALE: {
      if (draft.bible.settings.fontSizeScale > -3) {
        draft.bible.settings.fontSizeScale -= 1
      }
      break
    }
    case SAVE_ALL_LOGS_AS_SEEN: {
      action.payload.map(log => {
        draft.bible.changelog[log.date] = true
      })
      break
    }
    case ADD_TAG: {
      const tagId = generateUUID()
      draft.bible.tags[tagId] = {
        id: tagId,
        date: Date.now(),
        name: action.payload
      }
      break
    }
    case UPDATE_TAG: {
      draft.bible.tags[action.id].name = action.value
      const entitiesArray = ['highlights', 'notes', 'studies']

      entitiesArray.forEach(ent => {
        const entities = draft.bible[ent]
        Object.values(entities).forEach(entity => {
          const entityTags = entity.tags
          if (entityTags && entityTags[action.id]) {
            entityTags[action.id].name = action.value
          }
        })
      })

      break
    }
    case REMOVE_TAG: {
      delete draft.bible.tags[action.payload]

      const entitiesArray = ['highlights', 'notes', 'studies']

      entitiesArray.forEach(ent => {
        const entities = draft.bible[ent]
        Object.values(entities).forEach(entity => {
          const entityTags = entity.tags
          if (entityTags && entityTags[action.payload]) {
            delete entityTags[action.payload]
          }
        })
      })
      break
    }
    case TOGGLE_TAG_ENTITY: {
      const { item, tagId } = action.payload

      if (item.ids) {
        const hasTag =
          draft.bible[item.entity][Object.keys(item.ids)[0]].tags &&
          draft.bible[item.entity][Object.keys(item.ids)[0]].tags[tagId]

        Object.keys(item.ids).forEach(id => {
          // DELETE OPERATION - In order to have a true toggle, check only for first item with Object.keys(item.ids)[0]
          if (hasTag) {
            try {
              delete draft.bible.tags[tagId][item.entity][id]
              delete draft.bible[item.entity][id].tags[tagId]
            } catch (e) {
              Sentry.captureException(e)
            }

            // ADD OPERATION
          } else {
            if (!draft.bible.tags[tagId][item.entity]) {
              draft.bible.tags[tagId][item.entity] = {}
            }
            draft.bible.tags[tagId][item.entity][id] = true

            if (!draft.bible[item.entity][id].tags) {
              draft.bible[item.entity][id].tags = {}
            }
            draft.bible[item.entity][id].tags[tagId] = {
              id: tagId,
              name: draft.bible.tags[tagId].name
            }
          }
        })
      } else {
        // DELETE OPERATION
        if (
          draft.bible[item.entity][item.id].tags &&
          draft.bible[item.entity][item.id].tags[tagId]
        ) {
          delete draft.bible.tags[tagId][item.entity][item.id]
          delete draft.bible[item.entity][item.id].tags[tagId]
          // ADD OPERATION
        } else {
          if (!draft.bible.tags[tagId][item.entity]) {
            draft.bible.tags[tagId][item.entity] = {}
          }
          draft.bible.tags[tagId][item.entity][item.id] = true

          if (!draft.bible[item.entity][item.id].tags) {
            draft.bible[item.entity][item.id].tags = {}
          }
          draft.bible[item.entity][item.id].tags[tagId] = {
            id: tagId,
            name: draft.bible.tags[tagId].name
          }
        }
      }

      break
    }
    case CREATE_STUDY: {
      draft.bible.studies[action.payload] = {
        id: action.payload,
        created_at: Date.now(),
        modified_at: Date.now(),
        title: 'Document sans titre',
        content: null,
        user: {
          id: draft.id,
          displayName: draft.displayName,
          photoUrl: draft.photoURL
        }
      }
      break
    }
    case UPDATE_STUDY: {
      const study = draft.bible.studies[action.payload.id]
      if (study) {
        study.modified_at = Date.now()
        if (action.payload.content) study.content = action.payload.content
        if (action.payload.title) study.title = action.payload.title

        // Just in case
        study.user = {
          id: draft.id,
          displayName: draft.displayName,
          photoUrl: draft.photoURL
        }
      } else {
        throw new Error(`Cannot find study: ${action.payload.id}`)
      }
      break
    }
    case DELETE_STUDY: {
      delete draft.bible.studies[action.payload]
      removeEntityInTags(draft, 'studies', action.payload)
      break
    }
    case CHANGE_COLOR: {
      const currentTheme = draft.bible.settings.theme
      const color =
        action.color ||
        (currentTheme === 'dark'
          ? darkColors[action.name]
          : defaultColors[action.name])
      draft.bible.settings.colors[currentTheme][action.name] = color
      break
    }
    case DELETE_HISTORY: {
      draft.bible.history = []
      break
    }
    case SET_HISTORY: {
      const item = action.payload
      if (draft.bible.history.length) {
        const prevItem = draft.bible.history[0]
        if (prevItem.type === item.type) {
          if (
            item.type === 'verse' &&
            item.book == prevItem.book &&
            item.chapter == prevItem.chapter &&
            item.version == prevItem.version
          ) {
            return draft
          }

          if (item.type === 'strong' && item.Code == prevItem.Code) {
            return draft
          }

          if (item.type === 'word' && item.word == prevItem.word) {
            return draft
          }
        }
      }

      draft.bible.history.unshift({
        ...action.payload,
        date: Date.now()
      })
      draft.bible.history = draft.bible.history.slice(0, 50)
      break
    }
    case TOGGLE_COMPARE_VERSION: {
      if (draft.bible.settings.compare[action.payload]) {
        delete draft.bible.settings.compare[action.payload]
      } else {
        draft.bible.settings.compare[action.payload] = true
      }
      break
    }
    case SET_NOTIFICATION_ID: {
      draft.notifications.notificationId = action.payload
      break
    }
    case GET_CHANGELOG_SUCCESS: {
      draft.changelog.isLoading = false
      draft.changelog.lastSeen = Date.now().toString()
      draft.changelog.data = [...draft.changelog.data, ...action.payload]
      break
    }
    case GET_CHANGELOG_FAIL: {
      draft.changelog.isLoading = false
      break
    }
    case GET_VERSION_UPDATE_SUCCESS: {
      draft.needsUpdate = { ...draft.needsUpdate, ...action.payload }
      break
    }
    case SET_VERSION_UPDATED: {
      draft.needsUpdate[action.payload] = false
      break
    }
    default: {
      break
    }
  }
}, initialState)

// FONT-FAMILY
export function setFontFamily(payload) {
  return {
    type: SET_FONT_FAMILY,
    payload
  }
}

// NOTES
export function addNote(note, noteVerses) {
  return (dispatch, getState) => {
    let selectedVerses = noteVerses || getState().bible.selectedVerses
    selectedVerses = orderVerses(selectedVerses)
    const key = Object.keys(selectedVerses).join('/')
    dispatch(clearSelectedVerses())

    if (!key) return
    return dispatch({ type: ADD_NOTE, payload: { [key]: note } })
  }
}

export function deleteNote(noteId) {
  return {
    type: REMOVE_NOTE,
    payload: noteId
  }
}

// HIGHLIGHTS

export function addHighlight(color) {
  return (dispatch, getState) => {
    const { selectedVerses } = getState().bible
    const highlightedVerses = getState().user.bible.highlights

    dispatch(clearSelectedVerses())
    return dispatch({
      type: ADD_HIGHLIGHT,
      selectedVerses: addDateAndColorToVerses(
        selectedVerses,
        highlightedVerses,
        color
      )
    })
  }
}

export function removeHighlight() {
  return (dispatch, getState) => {
    const { selectedVerses } = getState().bible

    dispatch(clearSelectedVerses())
    return dispatch({ type: REMOVE_HIGHLIGHT, selectedVerses })
  }
}

// SETTINGS

export function setSettingsAlignContent(payload) {
  return {
    type: SET_SETTINGS_ALIGN_CONTENT,
    payload
  }
}

export function setSettingsTextDisplay(payload) {
  return {
    type: SET_SETTINGS_TEXT_DISPLAY,
    payload
  }
}

export function setSettingsTheme(payload) {
  return {
    type: SET_SETTINGS_THEME,
    payload
  }
}

export function setSettingsNotesDisplay(payload) {
  return {
    type: SET_SETTINGS_NOTES_DISPLAY,
    payload
  }
}

export function setSettingsCommentaires(payload) {
  return {
    type: SET_SETTINGS_COMMENTS_DISPLAY,
    payload
  }
}

export function increaseSettingsFontSizeScale() {
  return {
    type: INCREASE_SETTINGS_FONTSIZE_SCALE
  }
}

export function decreaseSettingsFontSizeScale() {
  return {
    type: DECREASE_SETTINGS_FONTSIZE_SCALE
  }
}

export function setSettingsPress(payload) {
  return {
    type: SET_SETTINGS_PRESS,
    payload
  }
}

export function toggleTagEntity({ item, tagId }) {
  return {
    type: TOGGLE_TAG_ENTITY,
    payload: { item, tagId }
  }
}

// STUDIES

export function createStudy(id) {
  return {
    type: CREATE_STUDY,
    payload: id
  }
}

export function updateStudy({ id, content, title }) {
  return {
    type: UPDATE_STUDY,
    payload: { id, content, title }
  }
}

export function uploadStudy(id) {
  return {
    type: UPLOAD_STUDY,
    payload: id
  }
}

export function deleteStudy(id) {
  return {
    type: DELETE_STUDY,
    payload: id
  }
}

// USERS

export function onUserLoginSuccess(profile, remoteLastSeen, studies) {
  return {
    type: USER_LOGIN_SUCCESS,
    profile,
    remoteLastSeen,
    studies
  }
}

export function onUserLogout() {
  return {
    type: USER_LOGOUT
  }
}

export function onUserUpdateProfile(profile) {
  return {
    type: USER_UPDATE_PROFILE,
    payload: profile
  }
}

export function changeColor({ name, color }) {
  return {
    type: CHANGE_COLOR,
    name,
    color
  }
}

// HISTORY

export function setHistory(item) {
  return {
    type: SET_HISTORY,
    payload: item
  }
}

export function deleteHistory() {
  return {
    type: DELETE_HISTORY
  }
}

export function updateUserData() {
  return {
    type: UPDATE_USER_DATA
  }
}

// Notifications

export function setNotificationVOD(payload) {
  return {
    type: SET_NOTIFICATION_VOD,
    payload
  }
}

export function setNotificationId(payload) {
  return {
    type: SET_NOTIFICATION_ID,
    payload
  }
}

// Compare

export function toggleCompareVersion(payload) {
  return {
    type: TOGGLE_COMPARE_VERSION,
    payload
  }
}

// Changelog

export function getChangelog() {
  return async (dispatch, getState) => {
    dispatch({
      type: GET_CHANGELOG
    })
    const lastChangelog = getState().user.changelog.lastSeen.toString()
    const changelogDoc = firebaseDb
      .collection('changelog')
      .where('date', '>', lastChangelog)
      .orderBy('date', 'desc')
      .limit(20)

    try {
      const querySnapshot = await changelogDoc.get({ source: 'server' })

      const changelog = []
      querySnapshot.forEach(doc => {
        changelog.push(doc.data())
      })

      return dispatch(addChangelog(changelog))
    } catch (e) {
      console.log(e)
      return dispatch({
        type: GET_CHANGELOG_FAIL
      })
    }
  }
}

export function addChangelog(payload) {
  return {
    type: GET_CHANGELOG_SUCCESS,
    payload
  }
}

// Bible Version update

export function getVersionUpdate() {
  return async dispatch => {
    dispatch({
      type: GET_VERSION_UPDATE
    })

    try {
      const versionsNeedUpdate = await Promise.all(
        Object.keys(versions).map(async versionId => {
          const needsUpdate = await getIfVersionNeedsUpdate(versionId)
          return { [versionId]: needsUpdate }
        })
      )

      dispatch({
        type: GET_VERSION_UPDATE_SUCCESS,
        payload: versionsNeedUpdate.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        )
      })
    } catch (e) {
      dispatch({
        type: GET_VERSION_UPDATE_FAIL
      })
    }
  }
}

export function setVersionUpdated(payload) {
  return {
    type: SET_VERSION_UPDATED,
    payload
  }
}

export function getDatabaseUpdate() {
  return async dispatch => {
    dispatch({
      type: GET_VERSION_UPDATE
    })

    try {
      const databasesNeedUpdate = await Promise.all(
        Object.keys(databases).map(async dbId => {
          const needsUpdate = await getIfDatabaseNeedsUpdate(dbId)
          return { [dbId]: needsUpdate }
        })
      )

      dispatch({
        type: GET_VERSION_UPDATE_SUCCESS,
        payload: databasesNeedUpdate.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        )
      })
    } catch (e) {
      dispatch({
        type: GET_VERSION_UPDATE_FAIL
      })
    }
  }
}