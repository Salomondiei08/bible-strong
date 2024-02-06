import produce from 'immer'
import { useAtomValue, useSetAtom } from 'jotai/react'
import { captureRef } from 'react-native-view-shot'
import useDynamicRefs from '~helpers/useDynamicRefs'
import {
  activeAtomIdAtom,
  activeTabIndexAtom,
  tabsAtom,
} from '../../../state/tabs'

const useTakeActiveTabSnapshot = () => {
  const activeAtomId = useAtomValue(activeAtomIdAtom)
  const activeTabIndex = useAtomValue(activeTabIndexAtom)
  const setTabs = useSetAtom(tabsAtom)
  const [getRef] = useDynamicRefs()

  return async () => {
    try {
      if (typeof activeTabIndex === 'undefined') {
        throw new Error('No active tab')
      }

      const cachedTabScreenRef = getRef(activeAtomId)

      if (!cachedTabScreenRef) {
        throw new Error('No active tab')
      }

      const data = await captureRef(cachedTabScreenRef, {
        result: 'base64',
        format: 'png',
      })
      const resolution = /^(\d+):(\d+)\|/g.exec(data)
      const base64 = data.substr((resolution || [''])[0].length || 0)

      setTabs(
        produce(draft => {
          draft[activeTabIndex].base64Preview = base64
        })
      )
    } catch {
      console.log('Error taking snapshot')
    }
  }
}

export default useTakeActiveTabSnapshot
