import Confetti from 'react-confetti'
import { createPortal } from 'react-dom'
import { useState } from 'react'
import useWindowSize from '../../../hooks/useWindowSize'
import { useAuth, useLogo, useModal } from '../../../zustand'
import { loginWithVk } from '../../../services/vkAuth'
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
			name: "Приз",
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
		// If this is a demo play (unauthenticated), trigger VK ID auth
		if (isDemo) {
			setIsAuthLoading(true)
			try {
				// loginWithVk() делает redirect на VK ID — страница уходит.
				// После авторизации VK вернёт на сайт, 
				// App.jsx → checkOAuthCallback() обработает токен.
				await loginWithVk()
				// Сюда код не дойдёт — страница уже ушла на VK
			} catch (err) {
				console.error('VK auth error:', err)
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