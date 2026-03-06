import { useEffect, useState } from 'react'

import { useActiveVkuiLocation } from './lib/router'

import useInitData from './hooks/useInitData'

import { checkOAuthCallback, loadAuthData } from './services/vkAuth'
import { getVkUserInfo } from './services/vkApi'
import { useAuth } from './zustand'

import IsEmployee from './components/Dummy/IsEmployee/IsEmployee'
import Loading from './components/Dummy/Loading/Loading'
import NotInitialized from './components/Dummy/NotInitialized/NotInitialized'
import Main from './components/Main/Main'
import Catalog from './pages/Catalog/Catalog'
import Coupon from './pages/Coupon/Coupon'
import Game from './pages/Game/Game'
import Inventory from './pages/Inventory/Inventory'
import Profile from './pages/Profile/Profile'
import Quest from './pages/Quest/Quest'
import Review from './pages/Review/Review'
import Transactions from './pages/Transactions/Transactions'

function App() {

  const { panel: activePanel } = useActiveVkuiLocation()

  const setAuth = useAuth((state) => state.setAuth)
  const isAuthenticated = useAuth((state) => state.isAuthenticated)

  const { isLoading, isParamsLoaded, isInviteLink, isEmployee, loadData } = useInitData()
  const [initDone, setInitDone] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Check if returning from OAuth redirect
        const callbackAuth = checkOAuthCallback()
        if (callbackAuth) {
          const vkUser = await getVkUserInfo(callbackAuth.access_token)
          if (vkUser) {
            setAuth({ vkToken: callbackAuth.access_token, vkUser })
            setInitDone(true)
            return
          }
        }

        // 2. Check for saved session
        const savedAuth = loadAuthData()
        if (savedAuth?.access_token) {
          try {
            const vkUser = await getVkUserInfo(savedAuth.access_token)
            if (vkUser) {
              setAuth({ vkToken: savedAuth.access_token, vkUser })
            }
          } catch (err) {
            console.warn('Saved VK session expired:', err)
          }
        }
      } catch (error) {
        console.error('Init error:', error)
      } finally {
        setInitDone(true)
      }
    }

    init()
  }, [])

  // Load backend data when authenticated
  useEffect(() => {
    if (isAuthenticated && initDone) {
      loadData()
    }
  }, [isAuthenticated, initDone])

  if (!initDone) {
    return <Loading />
  }

  // If not authenticated, show game screen (user can play first, then auth on claim)
  if (!isAuthenticated) {
    return (
      <Main>
        <div style={{ display: activePanel === 'game' || !activePanel ? 'block' : 'none' }}>
          <Game />
        </div>
      </Main>
    )
  }

  if (isLoading) {
    return <Loading />
  }

  if (isEmployee) {
    return <IsEmployee />
  }

  if (!isParamsLoaded) {
    return <NotInitialized />
  }

  if (isInviteLink) {
    return <NotInitialized />
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'game':
        return <Game />
      case 'profile':
        return <Profile />
      case 'transactions':
        return <Transactions />
      case 'inventory':
        return <Inventory />
      case 'catalog':
        return <Catalog />
      case 'quest':
        return <Quest />
      case 'coupon':
        return <Coupon />
      case 'review':
        return <Review />
      default:
        return <Game />
    }
  }

  return (
    <Main>
      {renderPanel()}
    </Main>
  )
}

export default App
