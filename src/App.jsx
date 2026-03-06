import { useEffect, useState } from 'react'

import { useActiveVkuiLocation } from './lib/router'

import useInitData from './hooks/useInitData'

import { checkOAuthCallback, loadAuthData, clearAuthData } from './services/vkAuth'
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

  const { isLoading, isParamsLoaded, isInviteLink, isEmployee, initError, hasAttemptedLoad, loadData } = useInitData()
  const [initDone, setInitDone] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // 0. DEV MODE: пропускаем VK OAuth для тестирования
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
        if (hashParams.get('devmode') === 'true') {
          const devUserId = hashParams.get('vk_user_id') || '100001'
          console.log('[App] 🔧 DEV MODE — fake auth, vk_user_id:', devUserId)
          setAuth({
            vkToken: 'dev_token',
            vkUser: {
              id: Number(devUserId),
              first_name: 'Dev',
              last_name: 'User',
              sex: 0,
              bdate: null,
              photo_200: '',
            }
          })
          setInitDone(true)
          return
        }

        // 1. Check if returning from OAuth redirect
        const callbackResult = await checkOAuthCallback()
        if (callbackResult === 'redirecting') {
          return
        }

        // 2. Check for saved session
        const savedAuth = loadAuthData()
        if (savedAuth?.access_token) {
          try {
            console.log('[App] Fetching VK user info...')
            const vkUser = await getVkUserInfo(savedAuth.access_token)
            if (vkUser) {
              console.log('[App] VK user OK:', { id: vkUser.id, name: vkUser.first_name })
              setAuth({ vkToken: savedAuth.access_token, vkUser })
            } else {
              console.warn('[App] getVkUserInfo returned null — clearing session')
              clearAuthData()
            }
          } catch (err) {
            console.warn('[App] Saved VK session expired:', err)
            clearAuthData()
          }
        }
      } catch (error) {
        console.error('[App] Init error:', error)
      } finally {
        setInitDone(true)
      }
    }

    init()
  }, [])

  // Load backend data when authenticated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAuthenticated && initDone) {
      console.log('[App] Auth ready, calling loadData...')
      loadData()
    }
  }, [isAuthenticated, initDone])

  if (!initDone) {
    return <Loading />
  }

  // If not authenticated, show game screen (rocket)
  if (!isAuthenticated) {
    return (
      <Main>
        <div style={{ display: activePanel === 'game' || !activePanel ? 'block' : 'none' }}>
          <Game />
        </div>
      </Main>
    )
  }

  // Loading: either actively loading OR haven't tried yet (waiting for effect to fire)
  if (isLoading || !hasAttemptedLoad) {
    return <Loading />
  }

  // Error or missing params — показываем retry, НЕ заглушку
  if (!isParamsLoaded) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(180deg, #0D0D1A 0%, #5B2D82 40%, #7B3FA0 100%)',
        color: 'white',
        fontFamily: 'Montserrat, sans-serif',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ fontSize: '16px', lineHeight: 1.5, marginBottom: '24px', maxWidth: '300px' }}>
          {initError || 'Не удалось загрузить данные заведения'}
        </p>
        <button
          onClick={() => loadData()}
          style={{
            background: 'linear-gradient(145deg, #C8E635, #A8C61A)',
            color: '#1A1A2E',
            border: 'none',
            borderRadius: '30px',
            padding: '14px 40px',
            fontWeight: 900,
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Попробовать снова
        </button>
        <button
          onClick={() => {
            clearAuthData()
            try { localStorage.removeItem('levone_init_params') } catch(e) {}
            window.location.reload()
          }}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '30px',
            padding: '10px 30px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Выйти и начать заново
        </button>
      </div>
    )
  }

  if (isEmployee) {
    return <IsEmployee />
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
