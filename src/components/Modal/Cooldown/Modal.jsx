import Lottie from 'lottie-react'; // 1. Импорт Lottie
import { getTimeLeft } from '../../../helpers/time'
import { useCompany, useLogo, useModal, useQuestCooldown } from '../../../zustand'
import Countdown from '../../Countdown/Countdown'

import cooldownAnimation from '../../../assets/Chel time.json'

import { useEffect, useRef } from 'react'
import styles from './Modal.module.scss'

const Modal = ({ onClose }) => {

	const cooldown = useQuestCooldown((state) => state.questCooldown)
	const unsetCooldown = useQuestCooldown((state) => state.unsetQuestCooldown)
	const lottieRef = useRef()

	const logotype = useLogo((state) => state.logotype)
	// eslint-disable-next-line no-unused-vars
	const domain = useCompany((state) => state.domain)

	const clearQueue = useModal((state) => state.clearQueue)

	const onComplete = () => {
		unsetCooldown()
		clearQueue({
			pageId: 'quest'
		})
	}

	useEffect(() => {
		// 2. Как только компонент загрузился, меняем скорость
		if (lottieRef.current) {
			// 2.0 = в 2 раза быстрее
			// 0.5 = в 2 раза медленнее
			// 1.5 = в 1.5 раза быстрее
			lottieRef.current.setSpeed(2.5)
		}
	}, [])



	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<p className={styles.title}>ЗАДАНИЕ ПЕРЕЗАРЯЖАЕТСЯ</p>
				</div>

				<div className={styles.body}>

					<div className={styles.animationWrapper}>
						<Lottie
							lottieRef={lottieRef}
							animationData={cooldownAnimation}
							loop={false}
							className={styles.lottieAnim}
						/>
					</div>

					{/* Белая карточка с контентом */}
					<div className={styles.card}>
						<Countdown
							duration={getTimeLeft(cooldown?.last_activated_at, cooldown?.duration, import.meta.env.VITE_TZ)}
							onComplete={() => onComplete()}
							className={styles.countdown}
							color='#2C2C34' // Темный цвет цифр для белого фона
						/>
						<p className={styles.content}>
							Новое задание будет доступно через указанное время
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Modal