import * as FileSystem from 'expo-file-system'
import React, { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import DownloadRequired from '~common/DownloadRequired'
import Loading from '~common/Loading'
import SnackBar from '~common/SnackBar'
import { dictionnaireDB, initSQLiteDir } from '~helpers/sqlite'
import { useDBStateValue } from '~helpers/databaseState'
import { getDatabasesRef } from '~helpers/firebase'
import Box from './ui/Box'
import Progress from './ui/Progress'
import { getDatabases } from '~helpers/databases'

const DICTIONNAIRE_FILE_SIZE = 22532096

export const useWaitForDatabase = () => {
  const { t } = useTranslation()
  const [
    {
      dictionnaire: { isLoading, proposeDownload, startDownload, progress },
    },
    dispatch,
  ] = useDBStateValue()

  useEffect(() => {
    if (dictionnaireDB.get()) {
      dispatch({
        type: 'dictionnaire.setLoading',
        payload: false,
      })
    } else {
      const loadDBAsync = async () => {
        const dbPath = getDatabases().DICTIONNAIRE.path
        const dbFile = await FileSystem.getInfoAsync(dbPath)

        // if (__DEV__) {
        //   if (dbFile.exists) {
        //     FileSystem.deleteAsync(dbFile.uri)
        //     dbFile = await FileSystem.getInfoAsync(dbPath)
        //   }
        // }

        if (!dbFile.exists) {
          await initSQLiteDir()

          // Waiting for user to accept to download
          if (!startDownload) {
            dispatch({
              type: 'dictionnaire.setProposeDownload',
              payload: true,
            })
            return
          }

          try {
            if (!window.dictionnaireDownloadHasStarted) {
              window.dictionnaireDownloadHasStarted = true

              const sqliteDbUri = getDatabasesRef().DICTIONNAIRE

              console.log(`Downloading ${sqliteDbUri} to ${dbPath}`)

              await initSQLiteDir()

              await FileSystem.createDownloadResumable(
                sqliteDbUri,
                dbPath,
                undefined,
                ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
                  const idxProgress =
                    Math.floor(
                      (totalBytesWritten / DICTIONNAIRE_FILE_SIZE) * 100
                    ) / 100
                  dispatch({
                    type: 'dictionnaire.setProgress',
                    payload: idxProgress,
                  })
                }
              ).downloadAsync()

              await dictionnaireDB.init()

              dispatch({
                type: 'dictionnaire.setLoading',
                payload: false,
              })
              window.dictionnaireDownloadHasStarted = false
            }
          } catch (e) {
            SnackBar.show(
              t(
                "Impossible de commencer le téléchargement. Assurez-vous d'être connecté à internet."
              ),
              'danger'
            )
            dispatch({
              type: 'dictionnaire.setProposeDownload',
              payload: true,
            })
            dispatch({
              type: 'dictionnaire.setStartDownload',
              payload: false,
            })
          }
        } else {
          await dictionnaireDB.init()

          dispatch({
            type: 'dictionnaire.setLoading',
            payload: false,
          })
        }
      }

      loadDBAsync()
    }
  }, [dispatch, startDownload])

  const setStartDownload = value =>
    dispatch({
      type: 'dictionnaire.setStartDownload',
      payload: value,
    })

  return {
    isLoading,
    progress,
    proposeDownload,
    startDownload,
    setStartDownload,
  }
}

const waitForDatabase = ({
  hasBackButton,
  hasHeader,
  size,
}: {
  hasBackButton?: boolean
  size?: 'small' | 'large'
  hasHeader?: boolean
} = {}) => <T,>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> => (props: any) => {
  const { t } = useTranslation()
  const {
    isLoading,
    progress,
    proposeDownload,
    startDownload,
    setStartDownload,
  } = useWaitForDatabase()

  if (isLoading && startDownload) {
    return (
      <Box h={300} alignItems="center">
        <Loading message={t('Téléchargement du dictionnaire...')}>
          <Progress progress={progress} />
        </Loading>
      </Box>
    )
  }

  if (isLoading && proposeDownload) {
    return (
      <DownloadRequired
        hasBackButton={hasBackButton}
        hasHeader={hasHeader}
        size={size}
        title={t(
          'La base de données dictionnaire est requise pour accéder à cette page.'
        )}
        setStartDownload={setStartDownload}
        fileSize={22}
      />
    )
  }

  if (isLoading) {
    return (
      <Loading
        message={t('Chargement du dictionnaire...')}
        subMessage={t(
          'Merci de patienter, la première fois peut prendre plusieurs secondes...'
        )}
      />
    )
  }
  return <WrappedComponent {...props} />
}

export default waitForDatabase
