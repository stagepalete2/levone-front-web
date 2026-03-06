import { useEffect, useState } from 'react'
// import { WinConfetti } from '../Modal' // Убрано, так как не используется в новом дизайне
import { createPortal } from 'react-dom'

import usePlayGame from '../../../../api/handlers/game/playgame.handler'
import { useClient, useEmployee, useParams } from '../../../../zustand'
import styles from './Modal.module.scss'

// Импорт Lottie
import Lottie from 'lottie-react'
// ВАЖНО: Замените путь на реальный путь к вашему файлу анимации
import prizeAnimation from '../../../../assets/Ok.json'

const Modal = ({ onClose }) => {

	const [shake, setShake] = useState(false)
	const [isError, setIsError] = useState(false)
	const [code, setCode] = useState('')
	const [servedBy, setServedBy] = useState("")
	const branch = useParams((state) => state.branch)
	const client = useClient((state) => state.client)
	const employees = useEmployee((state) => state.employees)


	const { play } = usePlayGame()

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
			const response = await play({
				vk_user_id: client.vk_user_id,
				branch: branch,
				code: code,
				employee_id: servedBy
			})

			if (!response) {
				triggerError()
				return
			}
			onClose()
		} catch (error) {
			console.log(error)
			triggerError()
		}
	}

	const handleInputChange = (e) => {
		// Оставляем только цифры, максимум 4 символа
		const val = e.target.value.replace(/\D/g, '').slice(0, 5)
		setCode(val)

		// Если была ошибка, сбрасываем её при начале ввода
		if (isError) setIsError(false)
	}

	useEffect(() => {
		if (shake) {
			const timeout = setTimeout(() => setShake(false), 1000)
			return () => clearTimeout(timeout)
		}
	}, [shake])

	return createPortal(
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<p className={styles.title}>ВЫ ВЫИГРАЛИ ПРИЗ!</p>
				</div>

				<div className={styles.body}>
					<div className={styles.animationWrapper}>
						<Lottie animationData={prizeAnimation} loop={false} className={styles.lottieAnim} />
					</div>

					<div className={styles.whiteCard}>
						<p className={styles.informText}>ЧТОБЫ ЗАБРАТЬ МОНЕТЫ, ПОПРОСИТЕ У ОФИЦИАНТА КОД ДНЯ</p>

						<div className={`${styles.inputContainer} ${shake ? styles.shake : ''} ${isError ? styles.error : ''}`}>
							<input
								type="tel"
								className={styles.hiddenInput}
								value={code}
								onChange={handleInputChange}
								autoComplete="off"
							/>

							<div className={styles.visualLayer}>
								<span className={styles.label}>
									{isError ? 'НЕВЕРНЫЙ КОД' : 'ВВЕДИТЕ КОД'}
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

						<select
							className={styles.formControl}
							value={servedBy} // 1. Передаем состояние сюда
							onChange={(e) => setServedBy(e.target.value)}
						>
							<option value="" disabled> {/* 2. Убираем атрибут selected */}
								Выберите сотрудника
							</option>
							{employees.map((employee) => (
								<option key={employee.vk_user_id} value={employee.vk_user_id}>
									{employee.name} {employee.lastname}
								</option>
							))}
						</select>
					</div>

					<button className={styles.button} disabled={shake} onClick={() => handleSubmit()}>
						ПОЛУЧИТЬ
					</button>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal