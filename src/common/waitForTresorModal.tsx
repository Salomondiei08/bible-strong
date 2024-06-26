import * as FileSystem from 'expo-file-system'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import SnackBar from '~common/SnackBar'

import { useTranslation } from 'react-i18next'
import DownloadRequired from '~common/DownloadRequired'
import Loading from '~common/Loading'
import { getDatabases } from '~helpers/databases'
import { databasesRef } from '~helpers/firebase'
import { initSQLiteDir, tresorDB } from '~helpers/sqlite'
import Box from './ui/Box'
import Progress from './ui/Progress'

const STRONG_FILE_SIZE = 5434368

export const useWaitForDatabase = () => {
  const { t } = useTranslation()
  const [isLoading, setLoading] = useState(true)
  const [proposeDownload, setProposeDownload] = useState(false)
  const [startDownload, setStartDownload] = useState(false)
  const [progress, setProgress] = useState(0)
  const dispatch = useDispatch()

  useEffect(() => {
    if (tresorDB.get()) {
      setLoading(false)
    } else {
      const loadDBAsync = async () => {
        const sqliteDirPath = `${FileSystem.documentDirectory}SQLite`
        const sqliteDir = await FileSystem.getInfoAsync(sqliteDirPath)

        const dbPath = getDatabases().TRESOR.path
        const dbFile = await FileSystem.getInfoAsync(dbPath)

        // if (__DEV__) {
        //   if (dbFile.exists) {
        //     FileSystem.deleteAsync(dbFile.uri)
        //     dbFile = await FileSystem.getInfoAsync(dbPath)
        //   }
        // }

        if (!dbFile.exists) {
          // Waiting for user to accept to download
          if (!startDownload) {
            setProposeDownload(true)
            return
          }

          try {
            if (!window.tresorDownloadHasStarted) {
              window.tresorDownloadHasStarted = true

              const sqliteDbUri = databasesRef.TRESOR

              console.log(`Downloading ${sqliteDbUri} to ${dbPath}`)

              await initSQLiteDir()

              await FileSystem.createDownloadResumable(
                sqliteDbUri,
                dbPath,
                undefined,
                ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
                  const idxProgress =
                    Math.floor((totalBytesWritten / STRONG_FILE_SIZE) * 100) /
                    100
                  setProgress(idxProgress)
                }
              ).downloadAsync()

              await tresorDB.init()

              setLoading(false)
              window.tresorDownloadHasStarted = false
            }
          } catch (e) {
            SnackBar.show(
              t(
                "Impossible de commencer le téléchargement. Assurez-vous d'être connecté à internet."
              ),
              'danger'
            )
            setProposeDownload(true)
            setStartDownload(false)
          }
        } else {
          await tresorDB.init()
          setLoading(false)
        }
      }

      loadDBAsync()
    }
  }, [dispatch, startDownload, dispatch])

  return {
    isLoading,
    progress,
    proposeDownload,
    startDownload,
    setStartDownload,
  }
}

const waitForDatabase = <T,>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> => props => {
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
        <Loading message={t('Téléchargement de la base commentaires...')}>
          <Progress progress={progress} />
        </Loading>
      </Box>
    )
  }

  if (isLoading && proposeDownload) {
    return (
      <DownloadRequired
        hasHeader={false}
        title={t(
          'La base de données "Trésor de l\'écriture" est requise pour accéder à ce module.'
        )}
        setStartDownload={setStartDownload}
        fileSize={5.4}
      />
    )
  }

  if (isLoading) {
    return (
      <Loading
        message={t('Chargement de la base de données...')}
        subMessage={t(
          "Merci de patienter, la première fois peut prendre plusieurs secondes... Si au bout de 30s il ne se passe rien, n'hésitez pas à redémarrer l'app."
        )}
      />
    )
  }

  return <WrappedComponent {...props} />
}

export default waitForDatabase
