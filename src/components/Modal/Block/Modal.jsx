import { useState } from 'react'
import { useClient, useParams } from '../../../zustand'
import useActivateDelivery from '../../../api/handlers/delivery/activate.handler'
import { useNavigation } from '../../../hooks/useHandleNavigation'

import styles from './Modal.module.scss'

const Modal = ({ onClose }) => {
	const delivery = useParams((state) => state.delivery)
	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)
	const removeDelivery = useParams((state) => state.removeDelivery)

	const [code, setCode] = useState('')
	const [shake, setShake] = useState(false)
	const [isError, setIsError] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// Обрати внимание: теперь хук должен возвращать функцию, которая возвращает статус или boolean
	// Убедись, что useActivateDelivery возвращает { activate }
	const { activate } = useActivateDelivery()
	const { handleNavigation } = useNavigation()

	const triggerError = () => {
		setShake(true)
		setIsError(true)
		setTimeout(() => setShake(false), 500)
		setTimeout(() => setIsError(false), 2000)
	}

	const handleSubmit = async () => {
		if (code.length < 5) {
			triggerError()
			return
		}

		try {
			setIsLoading(true)

			// Вызываем API
			const success = await activate({
				vk_user_id: client.vk_user_id,
				branch: branch,
				code: code,
			})

			if (success) {
				console.log("Успешная активация")

				// 1. Удаляем из Zustand (локально)
				removeDelivery()

				// 2. Переходим на главную, ПРИНУДИТЕЛЬНО убирая delivery из URL
				handleNavigation('/', { delivery: null })

			} else {
				triggerError()
			}
		} catch (e) {
			console.error(e)
			triggerError()
		} finally {
			setIsLoading(false)
		}
	}

	const handleInputChange = (e) => {
		const val = e.target.value.replace(/\D/g, '').slice(0, 5)
		setCode(val)
	}

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<img src='/LevelUpLogo.png' alt="Levone logo" className={styles.logotype} />
				</div>
				<div className={styles.body}>
					{!delivery && (
						<>
							<p className={styles.text}>Вкусные блюда и маленькие сюрпризы ждут тебя! 😋<br />
								Приходи в наше кафе и отсканируй QR-код только <span className={styles.highlight}>на месте</span> — узнай, что приготовлено именно для тебя!</p>
							<img src="/icons/qr-code.png" alt="Иконка QR кода" className={styles.qr} loading='lazy' />
						</>
					)}

					{delivery && (
						<>
							<p className={styles.text}>Вкусные блюда и маленькие сюрпризы ждут тебя! приходите 😋<br />
								Или<br /> Введи последние 5 цифр из номера заказа (для доставки)</p>
							<div className={`${styles.inputContainer} ${shake ? styles.shake : ''} ${isError ? styles.error : ''}`}>
								<input
									type="tel"
									className={styles.hiddenInput}
									value={code}
									onChange={handleInputChange}
								/>

								<div className={styles.visualLayer}>
									<span className={styles.label}>
										{isError ? 'НЕВЕРНЫЙ НОМЕР ЗАКАЗА' : 'ВВЕДИТЕ НОМЕР ЗАКАЗА'}
									</span>
									<div className={styles.pinGrid}>
										{[...Array(5)].map((_, index) => (
											<div key={index} className={styles.pinCell}>
												{code[index] || ''}
											</div>
										))}
									</div>
								</div>
							</div>
							<button
								className={styles.submitButton}
								disabled={isLoading}
								onClick={handleSubmit}
							>
								{isLoading ? '...' : 'АКТИВИРОВАТЬ ДОСТАВКУ'}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default Modal