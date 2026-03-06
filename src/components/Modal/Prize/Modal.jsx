import Confetti from 'react-confetti'
import { createPortal } from 'react-dom'
import { useState } from 'react'
import useWindowSize from '../../../hooks/useWindowSize'
import { useAuth, useLogo, useModal } from '../../../zustand'
import { loginWithVk, parseVkBdate, saveAuthData } from '../../../services/vkAuth'
import { getVkUserInfo } from '../../../services/vkApi'
import styles from './Modal.module.scss'
import { useEffect } from 'react'

export const WinConfetti = () => {
	const { width, height } = useWindowSize()

	return (
		<Confetti
			initialVelocityY={5}
			gravity={0.8}
			recycle={false}
			width={width}
			height={height}
		/>
	)
}

const Modal = ({ prize, isDemo, onClose }) => {

	const coin = useLogo((state) => state.coin)
	const setAuth = useAuth((state) => state.setAuth)
	const pushModal = useModal((state) => state.pushModal)
	const [isAuthLoading, setIsAuthLoading] = useState(false)

	useEffect(() => {
		console.log(coin)
	}, [coin])

	const prizes = {
		prize: {
			name: "Супер Приз",
			icon: "/images/SuperPuperPrize.png",
			description: "Вам доступны 3 награды на выбор",
		},
		coin: {
			name: "Монеты",
			icon: (coin !== null && coin !== undefined) ? `${import.meta.env.VITE_BACKEND_DOMAIN}${coin}` : '/icons/coin.png',
			description: `Вы выиграли ${prize.reward} монет`,
		}
	}

	const currentPrize = prizes[prize.type]

	const handleClaim = async () => {
		// If this is a demo play (unauthenticated), trigger VK OAuth first
		if (isDemo) {
			setIsAuthLoading(true)
			try {
				const authData = await loginWithVk({ scope: 'groups' })
				if (authData?.access_token) {
					const vkUser = await getVkUserInfo(authData.access_token)
					if (vkUser) {
						saveAuthData(authData)
						setAuth({ vkToken: authData.access_token, vkUser })

						// Check if VK profile has birth date
						const parsedBdate = parseVkBdate(vkUser.bdate)

						// Close prize modal — App.jsx will re-render and load data
						// After data loads, birth modal will show if needed (no bdate)
						if (!parsedBdate) {
							// No birth date — birth modal will be shown by Game.jsx
							// (but now with skip button)
						}
						// If has bdate — it will be saved automatically during init

						onClose()
						// Force page reload to trigger full data initialization
						window.location.reload()
						return
					}
				}
			} catch (err) {
				console.error('VK auth error:', err)
			} finally {
				setIsAuthLoading(false)
			}
			return
		}

		// Normal claim for authenticated users
		onClose()
	}

	return createPortal(
		<div className={styles.overlay}>
			<div className={styles.confettiWrapper}>
				<WinConfetti />
			</div>

			<div className={styles.modal}>

				<div className={styles.header}>
					<p className={styles.title}>ВЫ ВЫИГРАЛИ ПРИЗ!</p>
				</div>

				<div className={styles.body}>
					<div className={styles.iconWrapper}>
						<img src={currentPrize.icon} alt={currentPrize.name} className={styles.icon} />
					</div>

					{/* Белая карточка с описанием */}
					<div className={styles.whiteCard}>
						<h3 className={styles.prizeName}>{currentPrize.name}</h3>
						<p className={styles.prizeDescription}>
							{currentPrize.description}
						</p>
					</div>

					<button
						className={styles.button}
						onClick={handleClaim}
						disabled={isAuthLoading}
					>
						{isAuthLoading ? 'АВТОРИЗАЦИЯ...' : 'ЗАБРАТЬ'}
					</button>

					{isDemo && (
						<p style={{
							color: 'rgba(255,255,255,0.6)',
							fontSize: 12,
							textAlign: 'center',
							marginTop: 8
						}}>
							Авторизация через ВКонтакте — быстро и безопасно
						</p>
					)}
				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal